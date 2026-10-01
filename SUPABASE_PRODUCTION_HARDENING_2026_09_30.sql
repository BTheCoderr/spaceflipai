-- SpaceFlip Pro — production hardening from the 2026-09-30 readiness audit
-- Run once against the current Supabase project before deploying the matching
-- generate-upgrade-plan Edge Function.

begin;

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

alter table public.generation_usage enable row level security;
revoke all on table public.generation_usage from public, anon, authenticated;
grant select, insert, update, delete on table public.generation_usage to service_role;

alter table public.generation_jobs
  drop constraint if exists generation_jobs_owned_storage_path_check;

alter table public.generation_jobs
  add constraint generation_jobs_owned_storage_path_check
  check (
    input_storage_path is null
    or input_storage_path like ('users/' || user_id::text || '/%')
  ) not valid;

revoke insert, update on table public.generation_jobs from authenticated;

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

commit;

-- Existing beta rows can be reviewed, then validated with:
-- alter table public.generation_jobs
--   validate constraint generation_jobs_owned_storage_path_check;
