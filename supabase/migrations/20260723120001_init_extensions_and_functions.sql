-- ============================================================================
-- DevSync — 0001 · Extensions & generic functions
-- ----------------------------------------------------------------------------
-- Foundational, table-independent objects that later migrations rely on.
-- gen_random_uuid() is available in Postgres core (v13+) on Supabase, so no
-- extension is required for UUID generation.
-- ============================================================================

-- Generic BEFORE UPDATE trigger: keeps updated_at accurate regardless of which
-- layer performs the write (never trusted to application code).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Sets updated_at = now() on row update. Attached BEFORE UPDATE to every table that has an updated_at column.';
