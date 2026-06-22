-- SpaceFlip Pro — Phase 16: Supabase Auth ownership (anonymous guest auth)
-- Run in Supabase Dashboard → SQL Editor.
--
-- What this does:
--   * Switches row ownership from the static 'demo-user' text id to the
--     authenticated Supabase user id (auth.uid()), including anonymous users.
--   * Replaces the MVP demo-user RLS policies with per-user policies.
--   * Restricts storage uploads/reads to each user's own folder.
--
-- PREREQUISITE — enable anonymous sign-ins (one-time, in the Dashboard):
--   Authentication → Sign In / Providers → Anonymous sign-ins → ON
--   (Without this, supabase.auth.signInAnonymously() returns 422 and the app
--    falls back to local-only behavior.)
--
-- Decision: user_id stays TEXT (not uuid).
--   Existing 'demo-user' rows use a non-uuid value, so we keep the column as
--   text and enforce ownership with auth.uid()::text. This is safe and avoids a
--   destructive type migration. New rows store the real auth uid as text.

-- ---------------------------------------------------------------------------
-- 1. Drop the 'demo-user' column default so new rows must carry a real uid.
--    (The app always sends the authenticated uid; we no longer want a default.)
-- ---------------------------------------------------------------------------
alter table public.generation_jobs alter column user_id drop default;
alter table public.design_projects alter column user_id drop default;

-- ---------------------------------------------------------------------------
-- 2. generation_jobs — per-user RLS
-- ---------------------------------------------------------------------------
alter table public.generation_jobs enable row level security;

-- Remove the old MVP demo-user policies.
drop policy if exists "MVP anon select generation_jobs demo-user" on public.generation_jobs;
drop policy if exists "MVP anon insert generation_jobs demo-user" on public.generation_jobs;
drop policy if exists "MVP anon update generation_jobs demo-user" on public.generation_jobs;

drop policy if exists "Users select own generation_jobs" on public.generation_jobs;
create policy "Users select own generation_jobs"
  on public.generation_jobs for select
  to authenticated
  using (user_id = auth.uid()::text);

drop policy if exists "Users insert own generation_jobs" on public.generation_jobs;
create policy "Users insert own generation_jobs"
  on public.generation_jobs for insert
  to authenticated
  with check (user_id = auth.uid()::text);

drop policy if exists "Users update own generation_jobs" on public.generation_jobs;
create policy "Users update own generation_jobs"
  on public.generation_jobs for update
  to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

drop policy if exists "Users delete own generation_jobs" on public.generation_jobs;
create policy "Users delete own generation_jobs"
  on public.generation_jobs for delete
  to authenticated
  using (user_id = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- 3. design_projects — per-user RLS
-- ---------------------------------------------------------------------------
alter table public.design_projects enable row level security;

drop policy if exists "MVP anon select design_projects demo-user" on public.design_projects;
drop policy if exists "MVP anon insert design_projects demo-user" on public.design_projects;
drop policy if exists "MVP anon update design_projects demo-user" on public.design_projects;
drop policy if exists "MVP anon delete design_projects demo-user" on public.design_projects;

drop policy if exists "Users select own design_projects" on public.design_projects;
create policy "Users select own design_projects"
  on public.design_projects for select
  to authenticated
  using (user_id = auth.uid()::text);

drop policy if exists "Users insert own design_projects" on public.design_projects;
create policy "Users insert own design_projects"
  on public.design_projects for insert
  to authenticated
  with check (user_id = auth.uid()::text);

drop policy if exists "Users update own design_projects" on public.design_projects;
create policy "Users update own design_projects"
  on public.design_projects for update
  to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

drop policy if exists "Users delete own design_projects" on public.design_projects;
create policy "Users delete own design_projects"
  on public.design_projects for delete
  to authenticated
  using (user_id = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- 4. Storage — design-inputs bucket, per-user folders
--    Path layout: users/{auth.uid()}/inputs/{timestamp}-{filename}
--    foldername(name) = ['users', '<uid>', 'inputs', ...]
--
-- Bucket visibility:
--   The design-inputs bucket is currently PUBLIC so getPublicUrl() can render
--   concept/original images without signed URLs. We keep it public in this
--   phase to avoid breaking image display. Writes are still restricted to the
--   owner's folder by the policies below. Move to a private bucket + signed
--   URLs in a later phase.
-- ---------------------------------------------------------------------------

-- Remove the old MVP anon storage policies.
drop policy if exists "MVP anon insert design-inputs" on storage.objects;
drop policy if exists "MVP anon select design-inputs" on storage.objects;
drop policy if exists "MVP anon delete design-inputs demo-user" on storage.objects;

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

-- Required for upsert (replace) of an existing object.
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
-- 5. (Optional) Clean up legacy demo-user rows once you no longer need them.
--    These rows are invisible to authenticated users under the new policies.
--    Uncomment to remove them permanently.
-- ---------------------------------------------------------------------------
-- delete from public.design_projects where user_id = 'demo-user';
-- delete from public.generation_jobs where user_id = 'demo-user';

-- ---------------------------------------------------------------------------
-- Verify (optional):
-- select policyname, cmd, roles from pg_policies
--   where schemaname in ('public', 'storage')
--   and tablename in ('generation_jobs', 'design_projects', 'objects')
--   order by tablename, cmd;
-- ---------------------------------------------------------------------------
