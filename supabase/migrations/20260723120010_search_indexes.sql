-- ============================================================================
-- DevSync — 0010 · Search indexes (Global Search Platform)
-- ----------------------------------------------------------------------------
-- The search platform uses two strategies:
--   • Snippets  → PostgreSQL full-text search on the existing generated
--     `search_vector` (idx_snippets_search, GIN) — see migration 0002.
--   • Projects / Collections / Tags → ILIKE substring matching.
--
-- To keep the ILIKE paths index-backed (not sequential scans) we enable the
-- pg_trgm extension and add trigram GIN indexes on the searched text columns.
-- Purely additive and idempotent; safe to re-run.
-- ============================================================================

create extension if not exists pg_trgm;

-- Projects: name + description substring search.
create index if not exists idx_projects_name_trgm
  on public.projects using gin (name gin_trgm_ops);
create index if not exists idx_projects_description_trgm
  on public.projects using gin (description gin_trgm_ops);

-- Collections: name + description substring search.
create index if not exists idx_collections_name_trgm
  on public.collections using gin (name gin_trgm_ops);
create index if not exists idx_collections_description_trgm
  on public.collections using gin (description gin_trgm_ops);

-- Snippets: title substring search (content is already covered by the FTS
-- vector; title trigram accelerates the ILIKE fallback and title ranking).
create index if not exists idx_snippets_title_trgm
  on public.snippets using gin (title gin_trgm_ops);

-- Workspace-scoped listing/sort support (search always filters by workspace).
create index if not exists idx_projects_workspace_updated
  on public.projects (workspace_id, updated_at desc);
create index if not exists idx_collections_workspace_updated
  on public.collections (workspace_id, updated_at desc);
