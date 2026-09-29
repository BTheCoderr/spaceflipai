-- SpaceFlip Pro — private property-photo storage migration
-- Apply after SUPABASE_AUTH_MIGRATION.sql on an existing SpaceFlip project.
--
-- Goal:
--   * Make design-inputs PRIVATE.
--   * Remove legacy anonymous/demo policies.
--   * Keep authenticated anonymous guest users limited to users/{auth.uid()}/...
--
-- The app resolves stored SpaceFlip image references to short-lived signed URLs,
-- so existing rows that contain getPublicUrl() references remain compatible.

-- ---------------------------------------------------------------------------
-- 1. Make the existing bucket private.
-- ---------------------------------------------------------------------------
update storage.buckets
set public = false
where id = 'design-inputs';

-- ---------------------------------------------------------------------------
-- 2. Remove legacy broad/demo access.
-- ---------------------------------------------------------------------------
drop policy if exists "MVP anon insert design-inputs" on storage.objects;
drop policy if exists "MVP anon select design-inputs" on storage.objects;
drop policy if exists "MVP anon delete design-inputs demo-user" on storage.objects;

-- ---------------------------------------------------------------------------
-- 3. Recreate owner-only policies idempotently.
-- ---------------------------------------------------------------------------
drop policy if exists "Users insert own design-inputs" on storage.objects;
create policy "Users insert own design-inputs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Users select own design-inputs" on storage.objects;
create policy "Users select own design-inputs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Users update own design-inputs" on storage.objects;
create policy "Users update own design-inputs"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
  with check (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Users delete own design-inputs" on storage.objects;
create policy "Users delete own design-inputs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Verify:
-- ---------------------------------------------------------------------------
-- select id, name, public
-- from storage.buckets
-- where id = 'design-inputs';
--
-- select policyname, cmd, roles
-- from pg_policies
-- where schemaname = 'storage'
--   and tablename = 'objects'
--   and policyname like '%design-inputs%'
-- order by cmd, policyname;
