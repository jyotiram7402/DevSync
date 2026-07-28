-- ============================================================================
-- DevSync — 0009 · Enable realtime for the clipboard sync engine
-- ----------------------------------------------------------------------------
-- Adds the snippets table to the supabase_realtime publication so INSERT/
-- UPDATE/DELETE changes broadcast to subscribed clients (persist-then-broadcast,
-- per docs/architecture/07-Realtime-Architecture.md). RLS still governs which
-- rows a subscriber receives. `replica identity full` ensures UPDATE/DELETE
-- payloads include the full previous row (useful for conflict handling).
-- ============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'snippets'
  ) then
    alter publication supabase_realtime add table public.snippets;
  end if;
end
$$;

alter table public.snippets replica identity full;
