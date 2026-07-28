-- ============================================================================
-- DevSync — 0008 · Extend projects for the Projects feature
-- ----------------------------------------------------------------------------
-- Additive, non-destructive columns required by the Projects feature module
-- (icon/color, favorite/pin/archive flags, updated_by). This does not redesign
-- existing structures — it augments the projects table already defined in 0002.
-- ============================================================================

alter table public.projects
  add column if not exists icon text,
  add column if not exists color text,
  add column if not exists is_favorite boolean not null default false,
  add column if not exists is_pinned boolean not null default false,
  add column if not exists is_archived boolean not null default false,
  add column if not exists updated_by uuid references public.profiles (id) on delete set null;

comment on column public.projects.icon is 'Optional icon key for the project (see feature icon registry).';
comment on column public.projects.color is 'Optional color key for the project (see feature color registry).';

-- Active (non-archived, non-deleted) listing ordered by recency.
create index if not exists idx_projects_active
  on public.projects (workspace_id, updated_at desc)
  where is_archived = false and deleted_at is null;

-- Favorite lookup within a workspace.
create index if not exists idx_projects_favorite
  on public.projects (workspace_id)
  where is_favorite and deleted_at is null;
