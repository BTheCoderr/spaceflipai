-- SpaceFlip Pro — Phase 18: Real AI concept image generation
-- Run in Supabase Dashboard → SQL Editor.
--
-- Adds image-generation tracking columns to generation_jobs. All are additive
-- and backward compatible: result_image_url keeps its existing meaning (the
-- image shown on the Result screen / PDF), and defaults keep current rows valid.
--
-- No new storage policies are required: the existing per-user storage policies
-- match users/{auth.uid()}/... regardless of the inputs|outputs subfolder, and
-- the Edge Function writes generated outputs with the service role (bypasses RLS).

alter table public.generation_jobs
  add column if not exists concept_image_url text;

alter table public.generation_jobs
  add column if not exists image_provider text not null default 'mock';

alter table public.generation_jobs
  add column if not exists image_generation_status text not null default 'not_started';

alter table public.generation_jobs
  add column if not exists image_generation_error text;

alter table public.generation_jobs
  add column if not exists estimated_image_cost_cents integer not null default 0;

-- Optional helper index for the per-user-per-day cost guard.
create index if not exists generation_jobs_user_created_idx
  on public.generation_jobs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Verify (optional):
-- select column_name, data_type, column_default
--   from information_schema.columns
--   where table_schema = 'public' and table_name = 'generation_jobs'
--     and column_name in (
--       'concept_image_url','image_provider','image_generation_status',
--       'image_generation_error','estimated_image_cost_cents'
--     );
-- ---------------------------------------------------------------------------
