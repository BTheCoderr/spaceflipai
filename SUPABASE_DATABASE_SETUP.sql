-- SpaceFlip Pro — Database setup (Phase 6)
-- Run in Supabase Dashboard → SQL Editor
--
-- Auth is NOT enabled yet. Rows use text user_id default 'demo-user'.
-- RLS policies below are MVP-only for anon testing — tighten before production.

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
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
  user_id text not null default 'demo-user',
  project_type text not null,
  goal text,
  budget_range text,
  notes text,
  input_image_uri text,
  input_storage_path text,
  input_public_url text,
  result_image_url text,
  status text not null default 'queued',
  source text,
  estimated_cost_cents integer,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generation_jobs_user_id_idx
  on public.generation_jobs (user_id);

create index if not exists generation_jobs_status_idx
  on public.generation_jobs (status);

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
  user_id text not null default 'demo-user',
  generation_job_id uuid references public.generation_jobs (id) on delete set null,
  project_type text not null,
  goal text,
  budget_range text,
  notes text,
  input_image_url text,
  result_image_url text,
  status text default 'saved',
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
-- Row Level Security (MVP — demo-user only, anon key)
-- Replace with auth.uid() policies when Supabase Auth is added.
-- ---------------------------------------------------------------------------
alter table public.generation_jobs enable row level security;
alter table public.design_projects enable row level security;

drop policy if exists "MVP anon select generation_jobs demo-user" on public.generation_jobs;
create policy "MVP anon select generation_jobs demo-user"
  on public.generation_jobs for select
  using (user_id = 'demo-user');

drop policy if exists "MVP anon insert generation_jobs demo-user" on public.generation_jobs;
create policy "MVP anon insert generation_jobs demo-user"
  on public.generation_jobs for insert
  with check (user_id = 'demo-user');

drop policy if exists "MVP anon update generation_jobs demo-user" on public.generation_jobs;
create policy "MVP anon update generation_jobs demo-user"
  on public.generation_jobs for update
  using (user_id = 'demo-user')
  with check (user_id = 'demo-user');

drop policy if exists "MVP anon select design_projects demo-user" on public.design_projects;
create policy "MVP anon select design_projects demo-user"
  on public.design_projects for select
  using (user_id = 'demo-user');

drop policy if exists "MVP anon insert design_projects demo-user" on public.design_projects;
create policy "MVP anon insert design_projects demo-user"
  on public.design_projects for insert
  with check (user_id = 'demo-user');

drop policy if exists "MVP anon update design_projects demo-user" on public.design_projects;
create policy "MVP anon update design_projects demo-user"
  on public.design_projects for update
  using (user_id = 'demo-user')
  with check (user_id = 'demo-user');

drop policy if exists "MVP anon delete design_projects demo-user" on public.design_projects;
create policy "MVP anon delete design_projects demo-user"
  on public.design_projects for delete
  using (user_id = 'demo-user');

-- ---------------------------------------------------------------------------
-- Verify (optional)
-- select tablename from pg_tables where schemaname = 'public'
--   and tablename in ('generation_jobs', 'design_projects');
