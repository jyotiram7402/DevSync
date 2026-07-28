-- ============================================================================
-- DevSync — 0006 · Storage buckets & policies (strategy only; no files)
-- ----------------------------------------------------------------------------
-- Two buckets are provisioned:
--   * avatars              — public-read; each user writes only under their own
--                            user-id folder:  avatars/<user_id>/<file>
--   * snippet-attachments  — private; access scoped to workspace membership via
--                            a workspace-id folder: snippet-attachments/<ws_id>/<file>
-- Policies enforce these path conventions against storage.objects.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152,
     array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('snippet-attachments', 'snippet-attachments', false, 10485760, null)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- avatars — public read; owner-only writes under their own folder.
-- ----------------------------------------------------------------------------
create policy "avatars public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy "avatars owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ----------------------------------------------------------------------------
-- snippet-attachments — private; workspace members read, editors write.
-- The first path folder must be a workspace the user belongs to. Comparison is
-- text-based (no uuid cast) to avoid errors on unexpected paths.
-- ----------------------------------------------------------------------------
create policy "attachments member read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'snippet-attachments'
    and (storage.foldername(name))[1] in (
      select m.workspace_id::text
      from public.workspace_members m
      where m.user_id = (select auth.uid())
    )
  );

create policy "attachments editor insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'snippet-attachments'
    and (storage.foldername(name))[1] in (
      select m.workspace_id::text
      from public.workspace_members m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'member')
    )
  );

create policy "attachments editor update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'snippet-attachments'
    and (storage.foldername(name))[1] in (
      select m.workspace_id::text
      from public.workspace_members m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'member')
    )
  );

create policy "attachments editor delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'snippet-attachments'
    and (storage.foldername(name))[1] in (
      select m.workspace_id::text
      from public.workspace_members m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'member')
    )
  );
