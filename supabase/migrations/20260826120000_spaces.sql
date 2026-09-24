-- ============================================================================
-- CopyAnywhere — 0013 · Spaces (live shared rooms)
-- ----------------------------------------------------------------------------
-- A Space is CopyAnywhere's first CROSS-USER surface: two or more people join a
-- shared, ephemeral room by a short code and everything one person shares
-- appears on the others' screens in real time (persist-then-broadcast).
--
-- Model:
--   spaces         — the room (short shareable code, owner, auto-expiry)
--   space_members  — who has joined a room
--   space_items    — the shared clipboard entries (text / link / file)
--
-- Security: membership is the boundary. Rooms cannot be listed or read unless
-- you are a member, and you can only BECOME a member through the join RPC, which
-- requires the human-shared code (the room's internal UUID alone is useless).
-- All membership checks go through a SECURITY DEFINER helper to avoid RLS
-- recursion on space_members.
--
-- Rooms start with a 24h expiry here; 0014 makes them permanent. No pg_cron
-- dependency. Intended to run once.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------
create table public.spaces (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique check (char_length(code) between 4 and 12),
  name       text not null default 'Shared Space' check (char_length(name) <= 80),
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

comment on table public.spaces is 'Ephemeral cross-user shared rooms, joined by a short code.';

create table public.space_members (
  id        uuid primary key default gen_random_uuid(),
  space_id  uuid not null references public.spaces (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (space_id, user_id)
);

comment on table public.space_members is 'Membership of a space (who has joined the room).';

create table public.space_items (
  id         uuid primary key default gen_random_uuid(),
  space_id   uuid not null references public.spaces (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       text not null default 'text'
               check (kind in ('text','code','url','image','pdf','office','file','archive','audio','video')),
  content    text not null default '' check (char_length(content) <= 20000),
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.space_items is 'A shared clipboard entry inside a space (text, link, or file).';

create index idx_space_members_user on public.space_members (user_id);
create index idx_space_members_space on public.space_members (space_id);
create index idx_space_items_space on public.space_items (space_id, created_at desc);
create index idx_spaces_expires on public.spaces (expires_at);

-- ----------------------------------------------------------------------------
-- Membership helper — SECURITY DEFINER so policies can check membership without
-- recursing into space_members' own RLS.
-- ----------------------------------------------------------------------------
create or replace function public.is_space_member(p_space_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.space_members
    where space_id = p_space_id and user_id = auth.uid()
  );
$$;

grant execute on function public.is_space_member(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.spaces        enable row level security;
alter table public.space_members enable row level security;
alter table public.space_items   enable row level security;

-- spaces: members can read; creator can delete. (Creation is via create_space.)
create policy spaces_select on public.spaces
  for select to authenticated using (public.is_space_member(id));
create policy spaces_delete on public.spaces
  for delete to authenticated using (created_by = (select auth.uid()));

-- space_members: members can see the roster; a user can remove only themselves
-- (leave). Joining is via join_space_by_code (SECURITY DEFINER) — no insert
-- policy, so members cannot be added by guessing a room's UUID.
create policy space_members_select on public.space_members
  for select to authenticated using (public.is_space_member(space_id));
create policy space_members_delete on public.space_members
  for delete to authenticated using (user_id = (select auth.uid()));

-- space_items: members read; members post (as themselves); author or the room
-- owner can delete.
create policy space_items_select on public.space_items
  for select to authenticated using (public.is_space_member(space_id));
create policy space_items_insert on public.space_items
  for insert to authenticated
  with check (public.is_space_member(space_id) and user_id = (select auth.uid()));
create policy space_items_delete on public.space_items
  for delete to authenticated using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.spaces s
      where s.id = space_id and s.created_by = (select auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- create_space(name) — makes a room with a unique code and joins the creator.
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
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
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

grant execute on function public.create_space(text) to authenticated;

-- ----------------------------------------------------------------------------
-- join_space_by_code(code) — validates the code + expiry and joins the caller.
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

  select * into v_space
  from public.spaces
  where code = upper(btrim(p_code)) and expires_at > now();

  if v_space.id is null then
    raise exception 'SPACE_NOT_FOUND';
  end if;

  insert into public.space_members (space_id, user_id)
  values (v_space.id, auth.uid())
  on conflict (space_id, user_id) do nothing;

  return v_space;
end;
$$;

grant execute on function public.join_space_by_code(text) to authenticated;

-- ----------------------------------------------------------------------------
-- Realtime — broadcast item and member changes to the room's subscribers. RLS
-- still governs which rows each subscriber receives.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'space_items'
  ) then
    alter publication supabase_realtime add table public.space_items;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'space_members'
  ) then
    alter publication supabase_realtime add table public.space_members;
  end if;
end
$$;

alter table public.space_items   replica identity full;
alter table public.space_members replica identity full;

-- ----------------------------------------------------------------------------
-- Storage — private bucket for shared files. Path: <space_id>/<item_id>/<file>.
-- Any member of the space (first path segment) may read/write/delete.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('space-attachments', 'space-attachments', false, 10485760, null)
on conflict (id) do nothing;

create policy "space-attachments member read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'space-attachments'
    and (storage.foldername(name))[1] in (
      select s.space_id::text from public.space_members s where s.user_id = (select auth.uid())
    )
  );

create policy "space-attachments member insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'space-attachments'
    and (storage.foldername(name))[1] in (
      select s.space_id::text from public.space_members s where s.user_id = (select auth.uid())
    )
  );

create policy "space-attachments member delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'space-attachments'
    and (storage.foldername(name))[1] in (
      select s.space_id::text from public.space_members s where s.user_id = (select auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- Cleanup helper — deletes rooms that were given an explicit expiry. Rooms are
-- permanent by default (see 0014), so nothing is scheduled; this can be wired
-- to pg_cron later if expiring rooms are ever reintroduced.
-- ----------------------------------------------------------------------------
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

comment on function public.purge_expired_spaces() is
  'Deletes spaces past an explicit expiry (cascades to members/items). Not scheduled by default.';
