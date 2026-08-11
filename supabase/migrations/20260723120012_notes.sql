-- ============================================================================
-- CopyAnywhere — 0012 · Quick Notes
-- ----------------------------------------------------------------------------
-- Personal notes/tasks owned by a USER (not a workspace), mirroring the devices
-- ownership model. RLS restricts every row to its owner; realtime broadcasts
-- changes to the owner's subscribed devices (persist-then-broadcast).
-- ============================================================================

create table public.notes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  title        text not null check (char_length(title) <= 200),
  content      text not null default '' check (char_length(content) <= 10000),
  status       text not null default 'pending' check (status in ('pending', 'completed')),
  priority     text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date     date,
  due_time     time,
  tags         text[] not null default '{}'
                 check (array_length(tags, 1) is null or array_length(tags, 1) <= 20),
  pinned       boolean not null default false,
  archived     boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.notes is 'Personal quick notes / tasks, owned by a user and synced across their devices.';

create index idx_notes_user_active on public.notes (user_id, archived, status);
create index idx_notes_user_due on public.notes (user_id, due_date);
create index idx_notes_user_pinned on public.notes (user_id, pinned) where pinned = true;
create index idx_notes_tags on public.notes using gin (tags);

-- Keep updated_at accurate (reuses the generic trigger from migration 0001).
create trigger set_notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- RLS — a user may only ever access their own notes.
-- ----------------------------------------------------------------------------
alter table public.notes enable row level security;

create policy notes_select on public.notes
  for select to authenticated using (user_id = (select auth.uid()));
create policy notes_insert on public.notes
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy notes_update on public.notes
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notes_delete on public.notes
  for delete to authenticated using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- Realtime — broadcast INSERT/UPDATE/DELETE to the owner's clients. RLS still
-- governs which rows a subscriber receives.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notes'
  ) then
    alter publication supabase_realtime add table public.notes;
  end if;
end
$$;

alter table public.notes replica identity full;
