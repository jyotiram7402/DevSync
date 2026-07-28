-- ============================================================================
-- DevSync — 0004 · Row Level Security & grants
-- ----------------------------------------------------------------------------
-- RLS is enabled on EVERY table (default-deny). Access is expressed via the
-- SECURITY DEFINER membership helpers from 0003, which prevents cross-workspace
-- access and avoids RLS recursion. Role capabilities:
--   owner  > admin  > member  > viewer (read-only)
-- "Editors" = owner/admin/member. Writes require an editor role; viewers read.
-- auth.uid() is wrapped in (select ...) so the planner evaluates it once.
-- ============================================================================

alter table public.profiles            enable row level security;
alter table public.workspaces          enable row level security;
alter table public.workspace_members   enable row level security;
alter table public.devices             enable row level security;
alter table public.projects            enable row level security;
alter table public.collections         enable row level security;
alter table public.snippets            enable row level security;
alter table public.snippet_collections enable row level security;
alter table public.sync_events         enable row level security;
alter table public.prompt_history      enable row level security;
alter table public.api_keys            enable row level security;
alter table public.audit_logs          enable row level security;

-- ----------------------------------------------------------------------------
-- profiles: own profile always; co-members' profiles for display.
-- ----------------------------------------------------------------------------
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.shares_workspace_with(id));

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- workspaces: members read; only the creating user may insert (owner_id = self,
-- membership added by trigger); admins/owners update; only owner deletes.
-- ----------------------------------------------------------------------------
create policy workspaces_select on public.workspaces
  for select to authenticated
  using (public.is_workspace_member(id));

create policy workspaces_insert on public.workspaces
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy workspaces_update on public.workspaces
  for update to authenticated
  using (public.has_workspace_role(id, array['owner', 'admin']))
  with check (public.has_workspace_role(id, array['owner', 'admin']));

create policy workspaces_delete on public.workspaces
  for delete to authenticated
  using (public.has_workspace_role(id, array['owner']));

-- ----------------------------------------------------------------------------
-- workspace_members: members see co-members; admins/owners manage; a member
-- may remove their own membership (leave).
-- ----------------------------------------------------------------------------
create policy workspace_members_select on public.workspace_members
  for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy workspace_members_insert on public.workspace_members
  for insert to authenticated
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy workspace_members_update on public.workspace_members
  for update to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy workspace_members_delete on public.workspace_members
  for delete to authenticated
  using (
    public.has_workspace_role(workspace_id, array['owner', 'admin'])
    or user_id = (select auth.uid())
  );

-- ----------------------------------------------------------------------------
-- devices: strictly personal.
-- ----------------------------------------------------------------------------
create policy devices_select on public.devices
  for select to authenticated using (user_id = (select auth.uid()));
create policy devices_insert on public.devices
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy devices_update on public.devices
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy devices_delete on public.devices
  for delete to authenticated using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- projects: members read; editors write.
-- ----------------------------------------------------------------------------
create policy projects_select on public.projects
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy projects_insert on public.projects
  for insert to authenticated
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));
create policy projects_update on public.projects
  for update to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));
create policy projects_delete on public.projects
  for delete to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));

-- ----------------------------------------------------------------------------
-- collections: members read; editors write.
-- ----------------------------------------------------------------------------
create policy collections_select on public.collections
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy collections_insert on public.collections
  for insert to authenticated
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));
create policy collections_update on public.collections
  for update to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));
create policy collections_delete on public.collections
  for delete to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));

-- ----------------------------------------------------------------------------
-- snippets: public snippets are world-readable (share links); otherwise
-- members read. Editors write, and creators are stamped as created_by.
-- ----------------------------------------------------------------------------
create policy snippets_select on public.snippets
  for select to anon, authenticated
  using (visibility = 'public' or public.is_workspace_member(workspace_id));

create policy snippets_insert on public.snippets
  for insert to authenticated
  with check (
    public.has_workspace_role(workspace_id, array['owner', 'admin', 'member'])
    and created_by = (select auth.uid())
  );

create policy snippets_update on public.snippets
  for update to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']))
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));

create policy snippets_delete on public.snippets
  for delete to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));

-- ----------------------------------------------------------------------------
-- snippet_collections: members read; editors assign/unassign.
-- ----------------------------------------------------------------------------
create policy snippet_collections_select on public.snippet_collections
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy snippet_collections_insert on public.snippet_collections
  for insert to authenticated
  with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));
create policy snippet_collections_delete on public.snippet_collections
  for delete to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));

-- ----------------------------------------------------------------------------
-- sync_events: members read the workspace feed; members append their own
-- events. Append-only (no update/delete policies → denied).
-- ----------------------------------------------------------------------------
create policy sync_events_select on public.sync_events
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy sync_events_insert on public.sync_events
  for insert to authenticated
  with check (
    public.is_workspace_member(workspace_id)
    and (user_id is null or user_id = (select auth.uid()))
  );

-- ----------------------------------------------------------------------------
-- prompt_history: private to the creating user within their workspace.
-- ----------------------------------------------------------------------------
create policy prompt_history_select on public.prompt_history
  for select to authenticated using (user_id = (select auth.uid()));
create policy prompt_history_insert on public.prompt_history
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id));
create policy prompt_history_delete on public.prompt_history
  for delete to authenticated using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- api_keys: a user manages their own keys. There is deliberately NO insert
-- policy — keys are minted server-side with the service role (which bypasses
-- RLS), so clients can never create a key or set key_hash directly.
-- ----------------------------------------------------------------------------
create policy api_keys_select on public.api_keys
  for select to authenticated using (user_id = (select auth.uid()));
create policy api_keys_update on public.api_keys
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy api_keys_delete on public.api_keys
  for delete to authenticated using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- audit_logs: readable by workspace owners/admins only. No write policies —
-- entries are created exclusively by the SECURITY DEFINER audit triggers, so
-- clients can neither forge nor tamper with the trail.
-- ----------------------------------------------------------------------------
create policy audit_logs_select_admin on public.audit_logs
  for select to authenticated
  using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

-- Users can always read events they performed (personal security activity),
-- including events with no workspace scope (e.g. device/API-key actions).
create policy audit_logs_select_own on public.audit_logs
  for select to authenticated
  using (actor_id = (select auth.uid()));

-- ============================================================================
-- GRANTS — least privilege for PostgREST roles. RLS remains the row gate.
-- ============================================================================
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema public to anon, authenticated;

-- Anonymous visitors may read public snippets (RLS restricts to visibility='public').
grant select on public.snippets to anon;

-- api_keys: hide the secret hash from client roles with column-level grants,
-- and forbid client inserts (keys are minted with the service role).
revoke all on public.api_keys from anon, authenticated;
grant select (
  id, workspace_id, user_id, name, key_prefix, scopes,
  last_used_at, expires_at, revoked_at, created_at, updated_at
) on public.api_keys to authenticated;
grant update (name, revoked_at) on public.api_keys to authenticated;
grant delete on public.api_keys to authenticated;
