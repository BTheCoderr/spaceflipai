-- SpaceFlip Pro — clean setup for a NEW Supabase project
--
-- Use this file for a fresh SpaceFlip backend.
-- Do NOT run the legacy demo-user setup first.
--
-- Dashboard prerequisite:
--   Authentication -> Sign In / Providers -> Anonymous sign-ins -> ON
--
-- This setup:
--   * creates the current generation_jobs and design_projects schema
--   * uses real Supabase Auth user UUIDs from day one
--   * enables owner-only RLS
--   * gives no table privileges to the unauthenticated anon role
--   * creates a PRIVATE design-inputs Storage bucket
--   * limits Storage access to users/{auth.uid()}/...
--
-- Anonymous Supabase users still use the Postgres "authenticated" role once
-- signInAnonymously() succeeds, so the policies below apply to guest workspaces.

begin;

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- generation_jobs
-- ---------------------------------------------------------------------------
create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_type text not null,
  goal text,
  budget_range text,
  notes text,
  input_image_uri text,
  input_storage_path text
    check (
      input_storage_path is null
      or input_storage_path like ('users/' || user_id::text || '/%')
    ),
  input_public_url text,
  result_image_url text,
  status text not null default 'queued'
    check (status in ('queued', 'uploading', 'processing', 'completed', 'failed')),
  source text,
  estimated_cost_cents integer not null default 0,
  result_payload jsonb not null default '{}'::jsonb,
  plan_source text not null default 'mock',
  ai_provider text not null default 'mock',
  concept_image_url text,
  image_provider text not null default 'mock',
  image_generation_status text not null default 'not_started',
  image_generation_error text,
  estimated_image_cost_cents integer not null default 0,
  image_generation_count integer not null default 0
    check (image_generation_count >= 0),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generation_jobs_user_id_idx
  on public.generation_jobs (user_id);

create index if not exists generation_jobs_status_idx
  on public.generation_jobs (status);

create index if not exists generation_jobs_user_created_idx
  on public.generation_jobs (user_id, created_at desc);

-- Server-owned usage ledger. This survives generation job deletion so clients
-- cannot reset daily AI spend caps by deleting rows.
create table if not exists public.generation_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null,
  usage_type text not null check (usage_type in ('plan', 'image')),
  created_at timestamptz not null default now()
);

create index if not exists generation_usage_user_type_created_idx
  on public.generation_usage (user_id, usage_type, created_at desc);

create index if not exists generation_usage_job_type_idx
  on public.generation_usage (job_id, usage_type);

create unique index if not exists generation_usage_one_plan_per_job_idx
  on public.generation_usage (job_id)
  where usage_type = 'plan';

-- Atomic quota reservation. Advisory locks serialize reservations per user and
-- usage type so concurrent scripts cannot race past the daily or per-job cap.
create or replace function public.reserve_generation_usage(
  p_user_id uuid,
  p_job_id uuid,
  p_usage_type text,
  p_daily_limit integer,
  p_job_limit integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_daily_count integer := 0;
  v_job_count integer := 0;
begin
  if p_user_id is null
     or p_job_id is null
     or p_usage_type not in ('plan', 'image')
     or p_daily_limit is null
     or p_daily_limit < 1
     or p_job_limit is null
     or p_job_limit < 1 then
    return pg_catalog.jsonb_build_object(
      'status', 'invalid',
      'daily_count', 0,
      'job_count', 0
    );
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text || ':' || p_usage_type, 0)
  );

  select count(*)::integer
    into v_daily_count
    from public.generation_usage
   where user_id = p_user_id
     and usage_type = p_usage_type
     and created_at >= pg_catalog.now() - interval '24 hours';

  select count(*)::integer
    into v_job_count
    from public.generation_usage
   where user_id = p_user_id
     and job_id = p_job_id
     and usage_type = p_usage_type;

  if v_daily_count >= p_daily_limit then
    return pg_catalog.jsonb_build_object(
      'status', 'daily_limit',
      'daily_count', v_daily_count,
      'job_count', v_job_count
    );
  end if;

  if v_job_count >= p_job_limit then
    return pg_catalog.jsonb_build_object(
      'status', 'job_limit',
      'daily_count', v_daily_count,
      'job_count', v_job_count
    );
  end if;

  insert into public.generation_usage (user_id, job_id, usage_type)
  values (p_user_id, p_job_id, p_usage_type);

  return pg_catalog.jsonb_build_object(
    'status', 'reserved',
    'daily_count', v_daily_count + 1,
    'job_count', v_job_count + 1
  );
end;
$$;

revoke all on function public.reserve_generation_usage(uuid, uuid, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.reserve_generation_usage(uuid, uuid, text, integer, integer)
  to service_role;

drop trigger if exists generation_jobs_set_updated_at on public.generation_jobs;
create trigger generation_jobs_set_updated_at
  before update on public.generation_jobs
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- design_projects
-- ---------------------------------------------------------------------------
create table if not exists public.design_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_job_id uuid references public.generation_jobs(id) on delete set null,
  project_type text not null,
  goal text,
  budget_range text,
  notes text,
  input_image_url text,
  result_image_url text,
  status text not null default 'saved',
  source text,
  checklist jsonb not null default '[]'::jsonb,
  budget_items jsonb not null default '[]'::jsonb,
  plan_summary text,
  contractor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists design_projects_user_id_idx
  on public.design_projects (user_id);

create index if not exists design_projects_generation_job_id_idx
  on public.design_projects (generation_job_id);

create index if not exists design_projects_project_type_idx
  on public.design_projects (project_type);

create index if not exists design_projects_created_at_idx
  on public.design_projects (created_at desc);

drop trigger if exists design_projects_set_updated_at on public.design_projects;
create trigger design_projects_set_updated_at
  before update on public.design_projects
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Data API privileges + Row Level Security
-- ---------------------------------------------------------------------------
alter table public.generation_jobs enable row level security;
alter table public.design_projects enable row level security;
alter table public.generation_usage enable row level security;

revoke all on table public.generation_jobs from anon;
revoke all on table public.design_projects from anon;
revoke all on table public.generation_usage from public, anon, authenticated;

grant usage on schema public to authenticated, service_role;

revoke all on table public.generation_jobs from authenticated;
grant select, delete on table public.generation_jobs to authenticated;
grant insert (
  user_id,
  project_type,
  goal,
  budget_range,
  notes,
  input_image_uri,
  input_storage_path,
  input_public_url,
  source
) on table public.generation_jobs to authenticated;
grant update (
  status,
  error_message,
  result_image_url
) on table public.generation_jobs to authenticated;
grant select, insert, update, delete on table public.generation_jobs to service_role;
grant select, insert, update, delete on table public.generation_usage to service_role;

grant select, insert, update, delete on table public.design_projects to authenticated, service_role;

drop policy if exists "Users select own generation_jobs" on public.generation_jobs;
create policy "Users select own generation_jobs"
  on public.generation_jobs for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users insert own generation_jobs" on public.generation_jobs;
create policy "Users insert own generation_jobs"
  on public.generation_jobs for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      input_storage_path is null
      or input_storage_path like ('users/' || (select auth.uid())::text || '/%')
    )
  );

drop policy if exists "Users update own generation_jobs" on public.generation_jobs;
create policy "Users update own generation_jobs"
  on public.generation_jobs for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users delete own generation_jobs" on public.generation_jobs;
create policy "Users delete own generation_jobs"
  on public.generation_jobs for delete
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users select own design_projects" on public.design_projects;
create policy "Users select own design_projects"
  on public.design_projects for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users insert own design_projects" on public.design_projects;
create policy "Users insert own design_projects"
  on public.design_projects for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      generation_job_id is null
      or exists (
        select 1
        from public.generation_jobs gj
        where gj.id = generation_job_id
          and gj.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "Users update own design_projects" on public.design_projects;
create policy "Users update own design_projects"
  on public.design_projects for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      generation_job_id is null
      or exists (
        select 1
        from public.generation_jobs gj
        where gj.id = generation_job_id
          and gj.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "Users delete own design_projects" on public.design_projects;
create policy "Users delete own design_projects"
  on public.design_projects for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Private Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('design-inputs', 'design-inputs', false)
on conflict (id) do update
set public = false;

-- Remove any legacy broad/demo policies if this is ever rerun on an older DB.
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
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

drop policy if exists "Users select own design-inputs" on storage.objects;
create policy "Users select own design-inputs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

-- Storage upsert requires SELECT + INSERT + UPDATE.
drop policy if exists "Users update own design-inputs" on storage.objects;
create policy "Users update own design-inputs"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

drop policy if exists "Users delete own design-inputs" on storage.objects;
create policy "Users delete own design-inputs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

-- Platform hardening: this Supabase helper does not need to be callable via RPC.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;

commit;

-- ---------------------------------------------------------------------------
-- Verification queries (read-only)
-- ---------------------------------------------------------------------------
-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
--   and tablename in ('generation_jobs', 'design_projects');
--
-- select policyname, schemaname, tablename, cmd, roles
-- from pg_policies
-- where (schemaname = 'public' and tablename in ('generation_jobs', 'design_projects'))
--    or (schemaname = 'storage' and tablename = 'objects' and policyname like '%design-inputs%')
-- order by schemaname, tablename, policyname;
--
-- select id, name, public
-- from storage.buckets
-- where id = 'design-inputs';
