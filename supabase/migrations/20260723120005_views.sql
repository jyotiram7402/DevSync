-- ============================================================================
-- DevSync — 0005 · Read-only views
-- ----------------------------------------------------------------------------
-- All views use security_invoker = on (Postgres 15+) so the querying user's
-- RLS applies to the underlying tables — a view can never leak rows the caller
-- could not read directly. Views are kept few and purposeful.
-- ============================================================================

-- Lightweight recent-snippets feed (excludes heavy content; joins project name).
create view public.recent_snippets
with (security_invoker = on) as
select
  s.id,
  s.workspace_id,
  s.project_id,
  p.name as project_name,
  s.title,
  s.type,
  s.language,
  s.tags,
  s.pinned,
  s.favorite,
  s.visibility,
  s.created_by,
  s.created_at,
  s.updated_at
from public.snippets s
left join public.projects p on p.id = s.project_id
where s.deleted_at is null
  and s.archived = false
order by s.created_at desc;

comment on view public.recent_snippets is 'RLS-respecting recent, non-archived snippets (metadata only).';

-- Per-workspace rollup counts for dashboards/overview.
create view public.workspace_overview
with (security_invoker = on) as
select
  w.id as workspace_id,
  w.name,
  w.plan,
  w.is_personal,
  (select count(*) from public.snippets s
     where s.workspace_id = w.id and s.deleted_at is null) as snippet_count,
  (select count(*) from public.projects pr
     where pr.workspace_id = w.id and pr.deleted_at is null) as project_count,
  (select count(*) from public.collections c
     where c.workspace_id = w.id and c.deleted_at is null) as collection_count,
  (select count(*) from public.workspace_members m
     where m.workspace_id = w.id) as member_count
from public.workspaces w
where w.deleted_at is null;

comment on view public.workspace_overview is 'RLS-respecting per-workspace summary counts.';

-- Per-user statistics (visible only for users the caller may see).
create view public.user_statistics
with (security_invoker = on) as
select
  pr.id as user_id,
  (select count(*) from public.snippets s
     where s.created_by = pr.id and s.deleted_at is null) as snippets_created,
  (select count(*) from public.devices d
     where d.user_id = pr.id and d.revoked_at is null) as active_devices
from public.profiles pr;

comment on view public.user_statistics is 'RLS-respecting per-user activity counts.';

grant select on public.recent_snippets to authenticated;
grant select on public.workspace_overview to authenticated;
grant select on public.user_statistics to authenticated;
