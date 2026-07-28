-- ============================================================================
-- DevSync — 0002 · Core schema (tables, constraints, indexes)
-- ----------------------------------------------------------------------------
-- Conventions (per Engineering Constitution §11):
--   * snake_case, plural table names
--   * UUID primary keys via gen_random_uuid()
--   * FKs named <entity>_id, explicit ON DELETE rules
--   * created_at / updated_at (UTC timestamptz), deleted_at for soft deletes
--   * ownership is workspace-scoped; RLS (migration 0004) keys on membership
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles — one row per authenticated user (1:1 with auth.users).
-- Deleting the auth user cascades away the profile (and everything they own).
-- ----------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.profiles is 'Application profile for an authenticated user; id equals auth.users.id.';

-- ----------------------------------------------------------------------------
-- workspaces — the ownership boundary for all content.
-- Every user gets a personal workspace on signup; teams reuse the same shape.
-- owner_id → profiles: the workspace owner. ON DELETE CASCADE removes a user's
-- personal workspace when the user is deleted.
-- ----------------------------------------------------------------------------
create table public.workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  is_personal boolean not null default true,
  plan        text not null default 'free' check (plan in ('free', 'pro')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
comment on table public.workspaces is 'Container that owns projects, snippets and collections. Personal (solo) or team.';

-- ----------------------------------------------------------------------------
-- workspace_members — membership + role; the access-control join table.
-- workspace_id → workspaces (cascade): remove memberships with the workspace.
-- user_id → profiles (cascade): remove memberships when the user is deleted.
-- Roles form an ordered capability set: owner > admin > member > viewer.
-- One membership per (workspace, user).
-- ----------------------------------------------------------------------------
create table public.workspace_members (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  role         text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (workspace_id, user_id)
);
comment on table public.workspace_members is 'Which users belong to which workspace and with what role.';

-- ----------------------------------------------------------------------------
-- devices — machines/clients registered to a USER (not a workspace); a user
-- may reach many workspaces from one device.
-- user_id → profiles (cascade).
-- ----------------------------------------------------------------------------
create table public.devices (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  name           text not null,
  os             text,
  browser        text,
  client_type    text not null default 'web' check (client_type in ('web', 'extension', 'vscode', 'cli', 'mobile')),
  client_version text,
  last_seen_at   timestamptz,
  revoked_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
comment on table public.devices is 'Registered devices/clients for a user, powering the device list and sync source.';

-- ----------------------------------------------------------------------------
-- projects — primary organizational container within a workspace.
-- workspace_id → workspaces (cascade). created_by → profiles (set null) so a
-- project survives its creator's departure (workspace-owned knowledge).
-- ----------------------------------------------------------------------------
create table public.projects (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 120),
  description  text,
  is_default   boolean not null default false,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
comment on table public.projects is 'A project/space within a workspace. Each workspace has one default "Inbox".';

-- ----------------------------------------------------------------------------
-- collections — cross-project grouping (many-to-many with snippets).
-- workspace_id → workspaces (cascade).
-- ----------------------------------------------------------------------------
create table public.collections (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 120),
  description  text,
  color        text,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
comment on table public.collections is 'Named, cross-project grouping of snippets within a workspace.';

-- ----------------------------------------------------------------------------
-- snippets — the core artifact.
-- workspace_id → workspaces (cascade).
-- project_id → projects (set null): deleting a project unfiles its snippets
--   rather than destroying them.
-- source_device_id → devices (set null).
-- created_by / updated_by → profiles (set null).
-- search_vector is a generated tsvector for full-text search (GIN indexed).
-- ----------------------------------------------------------------------------
create table public.snippets (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references public.workspaces (id) on delete cascade,
  project_id       uuid references public.projects (id) on delete set null,
  title            text check (char_length(title) <= 200),
  content          text not null check (char_length(content) <= 100000),
  language         text,
  type             text not null default 'text'
                     check (type in ('error', 'stacktrace', 'log', 'code', 'command', 'text')),
  tags             text[] not null default '{}'
                     check (array_length(tags, 1) is null or array_length(tags, 1) <= 50),
  pinned           boolean not null default false,
  favorite         boolean not null default false,
  archived         boolean not null default false,
  visibility       text not null default 'private'
                     check (visibility in ('private', 'workspace', 'public')),
  source_device_id uuid references public.devices (id) on delete set null,
  created_by       uuid references public.profiles (id) on delete set null,
  updated_by       uuid references public.profiles (id) on delete set null,
  metadata         jsonb not null default '{}'::jsonb,
  search_vector    tsvector generated always as (
                     to_tsvector('english'::regconfig, coalesce(title, '') || ' ' || coalesce(content, ''))
                   ) stored,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);
comment on table public.snippets is 'A synced clipboard/snippet record (error, log, code, command, note).';

-- ----------------------------------------------------------------------------
-- snippet_collections — M:N between snippets and collections.
-- Composite PK prevents duplicate memberships. workspace_id is denormalized so
-- RLS on this join table is a simple membership check (both parents share it).
-- ----------------------------------------------------------------------------
create table public.snippet_collections (
  snippet_id    uuid not null references public.snippets (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (snippet_id, collection_id)
);
comment on table public.snippet_collections is 'Assigns snippets to collections (many-to-many).';

-- ----------------------------------------------------------------------------
-- sync_events — append-only log of synchronization activity per workspace.
-- Complements Postgres/Realtime change streams with an auditable trail.
-- device_id / user_id → set null so the log survives device/user removal.
-- ----------------------------------------------------------------------------
create table public.sync_events (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  device_id    uuid references public.devices (id) on delete set null,
  entity_type  text not null,
  entity_id    uuid,
  action       text not null check (action in ('create', 'update', 'delete')),
  payload      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
comment on table public.sync_events is 'Append-only synchronization event log, scoped to a workspace.';

-- ----------------------------------------------------------------------------
-- prompt_history — future AI feature: prompts/responses tied to a workspace.
-- snippet_id → set null so history survives snippet deletion.
-- ----------------------------------------------------------------------------
create table public.prompt_history (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  snippet_id   uuid references public.snippets (id) on delete set null,
  provider     text,
  prompt       text not null,
  response     text,
  tokens       integer,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
comment on table public.prompt_history is 'Future AI prompt/response history (per user, per workspace).';

-- ----------------------------------------------------------------------------
-- api_keys — future CLI/API access. Stores only a HASH of the secret.
-- workspace_id → cascade, user_id → cascade (keys belong to a user in a ws).
-- ----------------------------------------------------------------------------
create table public.api_keys (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  name         text not null,
  key_prefix   text not null,
  key_hash     text not null,
  scopes       text[] not null default '{}',
  last_used_at timestamptz,
  expires_at   timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.api_keys is 'Hashed API keys for CLI/API clients. Plaintext secrets are never stored.';
comment on column public.api_keys.key_hash is 'Hash of the secret. Column-level grants (0004) hide it from client roles.';

-- ----------------------------------------------------------------------------
-- audit_logs — append-only security audit trail. Written only by SECURITY
-- DEFINER triggers (clients cannot insert), readable by workspace admins.
-- workspace_id nullable for account-level events. actor_id → set null.
-- ----------------------------------------------------------------------------
create table public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  actor_id     uuid references public.profiles (id) on delete set null,
  action       text not null,
  entity_type  text,
  entity_id    uuid,
  metadata     jsonb not null default '{}'::jsonb,
  ip_address   inet,
  created_at   timestamptz not null default now()
);
comment on table public.audit_logs is 'Append-only audit trail of security-relevant actions.';

-- ============================================================================
-- INDEXES — designed around real query shapes. Owner/workspace-leading
-- composite indexes match RLS (every query is workspace-scoped), partial
-- indexes exclude soft-deleted rows to keep hot indexes small.
-- ============================================================================

-- workspaces: "my workspaces" via owner; slug already uniquely indexed.
create index idx_workspaces_owner on public.workspaces (owner_id) where deleted_at is null;

-- workspace_members: reverse lookup ("which workspaces am I in").
create index idx_workspace_members_user on public.workspace_members (user_id);

-- devices: a user's active devices, most-recently-seen first.
create index idx_devices_user on public.devices (user_id, last_seen_at desc) where revoked_at is null;

-- projects: workspace listing + one default (Inbox) per workspace.
create index idx_projects_workspace on public.projects (workspace_id, created_at desc) where deleted_at is null;
create unique index uq_projects_default on public.projects (workspace_id) where is_default and deleted_at is null;

-- collections: workspace listing.
create index idx_collections_workspace on public.collections (workspace_id, created_at desc) where deleted_at is null;

-- snippets: the main reverse-chronological stream (per workspace / per project),
-- full-text search, tag filtering, pinned quick-access, author analytics,
-- public-share lookup, and device attribution.
create index idx_snippets_workspace on public.snippets (workspace_id, created_at desc) where deleted_at is null;
create index idx_snippets_project on public.snippets (project_id, created_at desc) where deleted_at is null;
create index idx_snippets_search on public.snippets using gin (search_vector);
create index idx_snippets_tags on public.snippets using gin (tags);
create index idx_snippets_pinned on public.snippets (workspace_id) where pinned and deleted_at is null;
create index idx_snippets_created_by on public.snippets (created_by);
create index idx_snippets_public on public.snippets (id) where visibility = 'public' and deleted_at is null;
create index idx_snippets_source_device on public.snippets (source_device_id);

-- snippet_collections: reverse (snippets in a collection) + workspace scoping.
create index idx_snippet_collections_collection on public.snippet_collections (collection_id);
create index idx_snippet_collections_workspace on public.snippet_collections (workspace_id);

-- sync_events: realtime/activity feed per workspace, plus per-device queries.
create index idx_sync_events_workspace on public.sync_events (workspace_id, created_at desc);
create index idx_sync_events_device on public.sync_events (device_id);
create index idx_sync_events_entity on public.sync_events (entity_type, entity_id);

-- prompt_history: per-workspace and per-user timelines (future analytics).
create index idx_prompt_history_workspace on public.prompt_history (workspace_id, created_at desc);
create index idx_prompt_history_user on public.prompt_history (user_id, created_at desc);

-- api_keys: user's keys, workspace scoping, and O(1) lookup by hash on auth.
create index idx_api_keys_user on public.api_keys (user_id);
create index idx_api_keys_workspace on public.api_keys (workspace_id);
create unique index uq_api_keys_hash on public.api_keys (key_hash);

-- audit_logs: workspace and actor timelines.
create index idx_audit_logs_workspace on public.audit_logs (workspace_id, created_at desc);
create index idx_audit_logs_actor on public.audit_logs (actor_id, created_at desc);

-- ============================================================================
-- updated_at triggers (only on tables with an updated_at column).
-- ============================================================================
create trigger set_updated_at before update on public.profiles          for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.workspaces         for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.workspace_members  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.devices            for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.projects           for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.collections        for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.snippets           for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.api_keys           for each row execute function public.set_updated_at();
