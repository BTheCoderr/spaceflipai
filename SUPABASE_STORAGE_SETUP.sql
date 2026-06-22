-- SpaceFlip Pro — Storage policies for MVP device testing (Phase 5)
-- Run in Supabase Dashboard → SQL Editor
--
-- Fixes: "new row violates row-level security policy" (403) on upload
-- NOTE (Phase 16): Auth is now enabled. Run SUPABASE_AUTH_MIGRATION.sql to
--   replace these anon demo-user policies with per-user policies scoped to
--   users/{auth.uid()}/inputs/... The bucket stays PUBLIC for image display.

-- Ensure bucket exists (create manually in Dashboard if this fails):
-- Storage → New bucket → name: design-inputs → Public: ON

-- ---------------------------------------------------------------------------
-- MVP: allow anon read + upload to design-inputs bucket only
-- ---------------------------------------------------------------------------
drop policy if exists "MVP anon insert design-inputs" on storage.objects;
create policy "MVP anon insert design-inputs"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'design-inputs');

drop policy if exists "MVP anon select design-inputs" on storage.objects;
create policy "MVP anon select design-inputs"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'design-inputs');

-- Optional: allow delete for demo cleanup (MVP only)
drop policy if exists "MVP anon delete design-inputs demo-user" on storage.objects;
create policy "MVP anon delete design-inputs demo-user"
  on storage.objects for delete
  to anon, authenticated
  using (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = 'demo-user'
  );

-- Verify (optional):
-- select policyname, cmd from pg_policies where tablename = 'objects' and schemaname = 'storage';
