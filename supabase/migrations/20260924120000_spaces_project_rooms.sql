-- ============================================================================
-- CopyAnywhere — 0014 · Spaces → permanent project rooms
-- ----------------------------------------------------------------------------
-- Builds on 0013 (spaces). Turns rooms into long-lived project rooms:
--   1. Rooms are permanent (no auto-expiry); they live until the owner deletes.
--   2. Items carry a category (error / code / doc / file) for in-room tabs.
--   3. The owner can remove members (members can still remove themselves).
--   4. list_space_members — roster with names/emails, visible to members only.
--   5. add_space_member_by_email — any member can add an existing user by email.
--
-- File cleanup for deleted items/rooms is done through the Storage API by the
-- app (not direct SQL deletes on storage.objects).
-- Run AFTER 20260826120000_spaces.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Permanent rooms
-- ----------------------------------------------------------------------------
alter table public.spaces alter column expires_at drop not null;
alter table public.spaces alter column expires_at drop default;
update public.spaces set expires_at = null;

-- Joining accepts permanent rooms (and still rejects any explicitly expired one).
create or replace function public.join_space_by_code(p_code text)
returns public.spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  v_space public.spaces;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  select * into v_space
  from public.spaces
  where code = upper(btrim(p_code))
    and (expires_at is null or expires_at > now());

  if v_space.id is null then
    raise exception 'SPACE_NOT_FOUND';
  end if;

  insert into public.space_members (space_id, user_id)
  values (v_space.id, auth.uid())
  on conflict (space_id, user_id) do nothing;

  return v_space;
end;
$$;

-- The daily purge now only touches rooms that were given an explicit expiry
-- (none are, by default) — permanent rooms are never auto-deleted.
create or replace function public.purge_expired_spaces()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  delete from public.spaces
   where expires_at is not null
     and expires_at < now();

  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. Item categories (drive the All / Errors / Code / Docs / Files tabs)
-- ----------------------------------------------------------------------------
alter table public.space_items
  add column if not exists category text not null default 'code'
    check (category in ('error', 'code', 'doc', 'file'));

update public.space_items
   set category = case
     when kind in ('pdf', 'office') then 'doc'
     when kind in ('image', 'file', 'archive', 'audio', 'video') then 'file'
     else 'code'
   end;

create index if not exists idx_space_items_category
  on public.space_items (space_id, category, created_at desc);

-- ----------------------------------------------------------------------------
-- 3. Owner can remove members; anyone can still remove themselves (leave).
-- ----------------------------------------------------------------------------
drop policy if exists space_members_delete on public.space_members;
create policy space_members_delete on public.space_members
  for delete to authenticated using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.spaces s
      where s.id = space_id and s.created_by = (select auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- 4. Member roster — profiles are private to workspace co-members, so fellow
--    room members read names/emails through this function (members only).
-- ----------------------------------------------------------------------------
create or replace function public.list_space_members(p_space_id uuid)
returns table (
  user_id      uuid,
  email        text,
  display_name text,
  joined_at    timestamptz,
  is_owner     boolean
)
language sql
security definer
stable
set search_path = public
as $$
  select m.user_id,
         p.email,
         p.display_name,
         m.joined_at,
         (m.user_id = s.created_by) as is_owner
  from public.space_members m
  join public.spaces s on s.id = m.space_id
  left join public.profiles p on p.id = m.user_id
  where m.space_id = p_space_id
    and public.is_space_member(p_space_id)
  order by (m.user_id = s.created_by) desc, m.joined_at asc;
$$;

-- ----------------------------------------------------------------------------
-- 5. Invite by email — any member may add an existing CopyAnywhere user
--    (members can already share the room code, so this grants nothing new).
--    Returns 'added' or 'already_member'.
-- ----------------------------------------------------------------------------
create index if not exists idx_profiles_email_lower on public.profiles (lower(email));

create or replace function public.add_space_member_by_email(p_space_id uuid, p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     uuid;
  v_inserted integer;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;
  if not public.is_space_member(p_space_id) then
    raise exception 'NOT_A_MEMBER';
  end if;

  select id into v_user
  from public.profiles
  where lower(email) = lower(btrim(p_email))
  limit 1;

  if v_user is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  insert into public.space_members (space_id, user_id)
  values (p_space_id, v_user)
  on conflict (space_id, user_id) do nothing;

  get diagnostics v_inserted = row_count;
  return case when v_inserted = 0 then 'already_member' else 'added' end;
end;
$$;

-- ----------------------------------------------------------------------------
-- Privileges — Postgres grants EXECUTE to PUBLIC on new functions by default.
-- Restrict every Spaces function to signed-in users; the purge helper is not
-- callable by any client role.
-- ----------------------------------------------------------------------------
revoke execute on function public.is_space_member(uuid) from public, anon;
grant  execute on function public.is_space_member(uuid) to authenticated;

revoke execute on function public.create_space(text) from public, anon;
grant  execute on function public.create_space(text) to authenticated;

revoke execute on function public.join_space_by_code(text) from public, anon;
grant  execute on function public.join_space_by_code(text) to authenticated;

revoke execute on function public.list_space_members(uuid) from public, anon;
grant  execute on function public.list_space_members(uuid) to authenticated;

revoke execute on function public.add_space_member_by_email(uuid, text) from public, anon;
grant  execute on function public.add_space_member_by_email(uuid, text) to authenticated;

revoke execute on function public.purge_expired_spaces() from public, anon, authenticated;
