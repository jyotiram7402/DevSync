-- ============================================================================
-- DevSync — 0007 · Additional storage buckets & policies
-- ----------------------------------------------------------------------------
-- Adds the two remaining buckets from the storage strategy (0006 created
-- `avatars` and `snippet-attachments`). Path convention: the first folder is
-- the owning workspace id, checked against workspace_members by the policies.
--   * workspace-assets — private; members read, editors write
--   * exports          — private; owners/admins only (may contain bulk data)
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('workspace-assets', 'workspace-assets', false, 5242880,
     array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('exports', 'exports', false, 52428800,
     array['application/json', 'application/x-ndjson', 'text/csv', 'application/zip'])
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- workspace-assets — members read; editors (owner/admin/member) write.
-- ----------------------------------------------------------------------------
create policy "workspace-assets member read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'workspace-assets'
    and (storage.foldername(name))[1] in (
      select m.workspace_id::text
      from public.workspace_members m
      where m.user_id = (select auth.uid())
    )
  );

create policy "workspace-assets editor insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'workspace-assets'
    and (storage.foldername(name))[1] in (
      select m.workspace_id::text
      from public.workspace_members m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'member')
    )
  );

create policy "workspace-assets editor update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'workspace-assets'
    and (storage.foldername(name))[1] in (
      select m.workspace_id::text
      from public.workspace_members m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'member')
    )
  );

create policy "workspace-assets editor delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'workspace-assets'
    and (storage.foldername(name))[1] in (
      select m.workspace_id::text
      from public.workspace_members m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'member')
    )
  );

-- ----------------------------------------------------------------------------
-- exports — owners/admins only (both read and write), as exports may bundle
-- large amounts of workspace data.
-- ----------------------------------------------------------------------------
create policy "exports admin read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'exports'
    and (storage.foldername(name))[1] in (
      select m.workspace_id::text
      from public.workspace_members m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin')
    )
  );

create policy "exports admin insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'exports'
    and (storage.foldername(name))[1] in (
      select m.workspace_id::text
      from public.workspace_members m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin')
    )
  );

create policy "exports admin delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'exports'
    and (storage.foldername(name))[1] in (
      select m.workspace_id::text
      from public.workspace_members m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin')
    )
  );
