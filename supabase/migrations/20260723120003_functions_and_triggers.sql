-- ============================================================================
-- DevSync — 0003 · Access-control helpers, provisioning & audit triggers
-- ----------------------------------------------------------------------------
-- The membership helpers are SECURITY DEFINER so they bypass RLS on
-- workspace_members. This is deliberate and essential: RLS policies (0004)
-- call these helpers, and without definer rights the policies would recurse
-- into workspace_members' own RLS. All definer functions pin an empty
-- search_path and fully-qualify object names to prevent search-path hijacking.
-- ============================================================================

-- Is the current user a member of the given workspace?
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = p_workspace_id
      and m.user_id = (select auth.uid())
  );
$$;
comment on function public.is_workspace_member(uuid) is
  'True if the current user belongs to the workspace. SECURITY DEFINER to avoid RLS recursion.';

-- Does the current user hold one of the given roles in the workspace?
create or replace function public.has_workspace_role(p_workspace_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = p_workspace_id
      and m.user_id = (select auth.uid())
      and m.role = any (p_roles)
  );
$$;
comment on function public.has_workspace_role(uuid, text[]) is
  'True if the current user has any of the given roles in the workspace. Used for write policies.';

-- Do the current user and the target user share any workspace? (member visibility)
create or replace function public.shares_workspace_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members m1
    join public.workspace_members m2 on m1.workspace_id = m2.workspace_id
    where m1.user_id = (select auth.uid())
      and m2.user_id = p_user_id
  );
$$;
comment on function public.shares_workspace_with(uuid) is
  'True if the current user co-belongs to a workspace with the target user (profile visibility).';

-- ----------------------------------------------------------------------------
-- Provisioning: create the owner membership for every new workspace.
-- Runs before the workspace INSERT ... RETURNING is evaluated, so the creating
-- user immediately passes the workspace SELECT policy.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (workspace_id, user_id) do nothing;
  return new;
end;
$$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();

-- ----------------------------------------------------------------------------
-- Provisioning: on signup, create the profile, a personal workspace (which in
-- turn gets an owner membership via the trigger above), and a default Inbox.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display   text;
  v_avatar    text;
  v_workspace uuid;
begin
  v_display := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'user_name', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Member'
  );
  v_avatar := coalesce(
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'picture', '')
  );

  insert into public.profiles (id, email, display_name, avatar_url)
  values (new.id, new.email, v_display, v_avatar)
  on conflict (id) do nothing;

  insert into public.workspaces (name, slug, owner_id, is_personal)
  values (
    v_display || '''s Workspace',
    'ws-' || substr(replace(new.id::text, '-', ''), 1, 12),
    new.id,
    true
  )
  returning id into v_workspace;

  insert into public.projects (workspace_id, name, is_default, created_by)
  values (v_workspace, 'Inbox', true, new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Audit: record security-relevant changes. SECURITY DEFINER so it can write to
-- audit_logs regardless of the actor's RLS (and clients cannot forge entries).
-- workspace_id/id are read generically from the row; devices have no
-- workspace_id, so that column is simply null for device events.
-- ----------------------------------------------------------------------------
create or replace function public.record_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row jsonb;
  v_workspace_id uuid;
begin
  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;

  -- Most tables carry workspace_id; for the workspaces table itself, the
  -- workspace is the row's own id (so admins can read these events).
  v_workspace_id := nullif(v_row ->> 'workspace_id', '')::uuid;
  if v_workspace_id is null and tg_table_name = 'workspaces' then
    v_workspace_id := nullif(v_row ->> 'id', '')::uuid;
  end if;

  insert into public.audit_logs (workspace_id, actor_id, action, entity_type, entity_id, metadata)
  values (
    v_workspace_id,
    (select auth.uid()),
    lower(tg_table_name) || '.' || lower(tg_op),
    tg_table_name,
    nullif(v_row ->> 'id', '')::uuid,
    jsonb_build_object('op', tg_op)
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

-- Attach audit to security-relevant tables. Device UPDATEs are excluded to
-- avoid logging routine last_seen_at heartbeats.
create trigger audit_workspaces
  after insert or delete on public.workspaces
  for each row execute function public.record_audit();

create trigger audit_workspace_members
  after insert or update or delete on public.workspace_members
  for each row execute function public.record_audit();

create trigger audit_devices
  after insert or delete on public.devices
  for each row execute function public.record_audit();

create trigger audit_api_keys
  after insert or update or delete on public.api_keys
  for each row execute function public.record_audit();
