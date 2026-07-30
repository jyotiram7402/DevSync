-- ============================================================================
-- DevSync — 0011 · Data retention policy (7-day sync window)
-- ----------------------------------------------------------------------------
-- DevSync is a synchronization tool, not an archive. Items expire automatically
-- so storage stays bounded and stale clipboard data does not accumulate.
--
-- TWO-STAGE DELETION (gives a recovery window without needing backups):
--   Stage 1 — after 7 days: soft delete (set deleted_at). The item disappears
--             from every client immediately (all app queries filter
--             `deleted_at is null`) but the row still exists.
--   Stage 2 — 7 days after that (14 days total): hard delete the row AND its
--             attachment object in storage, permanently freeing quota.
--
-- EXEMPT: pinned or favorited items are never auto-deleted. Marking an item is
-- how a user says "keep this".
--
-- Scheduled with pg_cron (runs inside Postgres — no external scheduler).
-- Both functions are SECURITY DEFINER because they must operate across all
-- users' rows, bypassing RLS. They are owned by the migration role and are not
-- callable in a way that leaks data (they return void).
--
-- Idempotent: safe to re-run.
-- ============================================================================

create extension if not exists pg_cron;

-- Retention windows (change these two values to re-tune the policy).
-- Stage 1: age at which an active item is soft-deleted.
-- Stage 2: how long a soft-deleted item is retained before permanent purge.
create or replace function public.devsync_retention_days()
returns integer
language sql
immutable
as $$ select 7 $$;

comment on function public.devsync_retention_days() is
  'Retention window in days for the DevSync auto-expiry policy (both stages).';

-- ----------------------------------------------------------------------------
-- Stage 1 — soft delete items older than the retention window.
-- Pinned and favorited items are preserved indefinitely.
-- ----------------------------------------------------------------------------
create or replace function public.soft_delete_expired_snippets()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  update public.snippets
     set deleted_at = now()
   where deleted_at is null
     and pinned = false
     and favorite = false
     and created_at < now() - (public.devsync_retention_days() || ' days')::interval;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

comment on function public.soft_delete_expired_snippets() is
  'Stage 1 of retention: soft-deletes non-pinned, non-favorited snippets older than the retention window.';

-- ----------------------------------------------------------------------------
-- Stage 2 — permanently purge soft-deleted items and their storage objects.
-- Attachment paths are `<workspaceId>/<snippetId>/<filename>`, so the snippet
-- id is the second path segment. Removing the storage row is what actually
-- reclaims the file-storage quota.
-- snippet_collections cascades; prompt_history sets null (see 0002).
-- ----------------------------------------------------------------------------
create or replace function public.purge_expired_snippets()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  cutoff timestamptz := now() - (public.devsync_retention_days() || ' days')::interval;
  affected integer;
begin
  -- Delete attachment objects belonging to snippets that are about to be purged.
  delete from storage.objects o
   using public.snippets s
   where o.bucket_id = 'snippet-attachments'
     and split_part(o.name, '/', 2) = s.id::text
     and s.deleted_at is not null
     and s.deleted_at < cutoff;

  -- Permanently remove the snippet rows.
  delete from public.snippets
   where deleted_at is not null
     and deleted_at < cutoff;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

comment on function public.purge_expired_snippets() is
  'Stage 2 of retention: permanently deletes soft-deleted snippets past the retention window, plus their storage attachments.';

-- ----------------------------------------------------------------------------
-- Schedule both stages daily. Unschedule first so re-running is safe.
-- Soft delete at 03:00 UTC, purge at 03:30 UTC.
-- ----------------------------------------------------------------------------
do $$
begin
  perform cron.unschedule('devsync-soft-delete-expired');
exception
  when others then null;
end
$$;

do $$
begin
  perform cron.unschedule('devsync-purge-expired');
exception
  when others then null;
end
$$;

select cron.schedule(
  'devsync-soft-delete-expired',
  '0 3 * * *',
  $$select public.soft_delete_expired_snippets()$$
);

select cron.schedule(
  'devsync-purge-expired',
  '30 3 * * *',
  $$select public.purge_expired_snippets()$$
);

-- Supporting index: both stages filter on these columns.
create index if not exists idx_snippets_retention
  on public.snippets (deleted_at, created_at)
  where pinned = false and favorite = false;
