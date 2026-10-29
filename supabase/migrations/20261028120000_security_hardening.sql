-- =============================================================================
-- Security hardening
--   1. Retention maintenance functions are no longer callable by clients.
--   2. Rooms: new join codes are 10 characters (was 6); wrong codes are
--      throttled, so codes can't be guessed.
--   3. Invite by email gives the same answer whether or not the address has an
--      account (no account lookup), and is throttled.
--   4. Room owners can rotate the join code (the app does it automatically
--      when the owner removes someone, so they can't rejoin with the old code).
-- Safe to run more than once.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. Retention functions: SECURITY DEFINER, so clients must not call them.
--    Postgres grants EXECUTE to PUBLIC on new functions by default. Skipped
--    when the retention migration was never applied.
-- ----------------------------------------------------------------------------
do $$
begin
  if to_regprocedure('public.soft_delete_expired_snippets()') is not null then
    revoke execute on function public.soft_delete_expired_snippets() from public, anon, authenticated;
  end if;
  if to_regprocedure('public.purge_expired_snippets()') is not null then
    revoke execute on function public.purge_expired_snippets() from public, anon, authenticated;
  end if;
  if to_regprocedure('public.devsync_retention_days()') is not null then
    revoke execute on function public.devsync_retention_days() from public, anon, authenticated;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 2 & 3. Throttling: a small log of rate-limited actions per person, written
--        and read only by the SECURITY DEFINER functions below.
-- ----------------------------------------------------------------------------
create table if not exists public.space_rate_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  action     text not null check (action in ('join_failed', 'invite')),
  created_at timestamptz not null default now()
);

create index if not exists idx_space_rate_events_user_action_time
  on public.space_rate_events (user_id, action, created_at desc);

alter table public.space_rate_events enable row level security;
-- No policies on purpose: clients can't read or write this table.
revoke all on public.space_rate_events from anon, authenticated;

create or replace function public.space_rate_limited(p_action text, p_limit integer, p_window interval)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select count(*) >= p_limit
  from public.space_rate_events
  where user_id = auth.uid()
    and action = p_action
    and created_at > now() - p_window;
$$;

-- ----------------------------------------------------------------------------
-- 2a. New rooms get 10-character codes (about a trillion possibilities).
--     Existing rooms keep their codes until the owner rotates them.
-- ----------------------------------------------------------------------------
create or replace function public.create_space(p_name text)
returns public.spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  v_space public.spaces;
  v_code  text;
  v_try   integer := 0;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  loop
    v_try := v_try + 1;
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    begin
      insert into public.spaces (code, name, created_by)
      values (v_code, coalesce(nullif(btrim(p_name), ''), 'Shared Space'), auth.uid())
      returning * into v_space;
      exit;
    exception when unique_violation then
      if v_try >= 5 then raise; end if;
    end;
  end loop;

  insert into public.space_members (space_id, user_id)
  values (v_space.id, auth.uid());

  return v_space;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2b. Joining: at most 10 wrong codes per 15 minutes per person. A wrong code
--     returns NULL (not an error) so the attempt is recorded — raising would
--     roll the record back. The app shows "That room code isn't valid."
-- ----------------------------------------------------------------------------
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

  if public.space_rate_limited('join_failed', 10, interval '15 minutes') then
    raise exception 'TOO_MANY_ATTEMPTS';
  end if;

  select * into v_space
  from public.spaces
  where code = upper(btrim(p_code))
    and (expires_at is null or expires_at > now());

  if v_space.id is null then
    delete from public.space_rate_events
    where user_id = auth.uid() and created_at < now() - interval '1 day';
    insert into public.space_rate_events (user_id, action) values (auth.uid(), 'join_failed');
    return null;
  end if;

  insert into public.space_members (space_id, user_id)
  values (v_space.id, auth.uid())
  on conflict (space_id, user_id) do nothing;

  return v_space;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. Invite by email: adds the person if they have an account; the answer is
--    always 'requested', so nobody can use it to look up who has an account.
--    At most 20 invites an hour per person.
-- ----------------------------------------------------------------------------
create or replace function public.add_space_member_by_email(p_space_id uuid, p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;
  if not public.is_space_member(p_space_id) then
    raise exception 'NOT_A_MEMBER';
  end if;
  if public.space_rate_limited('invite', 20, interval '1 hour') then
    raise exception 'TOO_MANY_ATTEMPTS';
  end if;

  insert into public.space_rate_events (user_id, action) values (auth.uid(), 'invite');

  select id into v_user
  from public.profiles
  where lower(email) = lower(btrim(p_email))
  limit 1;

  if v_user is not null then
    insert into public.space_members (space_id, user_id)
    values (p_space_id, v_user)
    on conflict (space_id, user_id) do nothing;
  end if;

  return 'requested';
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. Owner rotates the room's join code; the old code stops working.
-- ----------------------------------------------------------------------------
create or replace function public.rotate_space_code(p_space_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_try  integer := 0;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;
  if not exists (select 1 from public.spaces where id = p_space_id and created_by = auth.uid()) then
    raise exception 'NOT_OWNER';
  end if;

  loop
    v_try := v_try + 1;
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    begin
      update public.spaces set code = v_code where id = p_space_id;
      exit;
    exception when unique_violation then
      if v_try >= 5 then raise; end if;
    end;
  end loop;

  return v_code;
end;
$$;

-- ----------------------------------------------------------------------------
-- Privileges (re-applied for the replaced functions; idempotent).
-- ----------------------------------------------------------------------------
revoke execute on function public.space_rate_limited(text, integer, interval) from public, anon, authenticated;

revoke execute on function public.create_space(text) from public, anon;
grant  execute on function public.create_space(text) to authenticated;

revoke execute on function public.join_space_by_code(text) from public, anon;
grant  execute on function public.join_space_by_code(text) to authenticated;

revoke execute on function public.add_space_member_by_email(uuid, text) from public, anon;
grant  execute on function public.add_space_member_by_email(uuid, text) to authenticated;

revoke execute on function public.rotate_space_code(uuid) from public, anon;
grant  execute on function public.rotate_space_code(uuid) to authenticated;
