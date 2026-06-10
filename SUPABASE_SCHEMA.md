# Supabase Schema (Draft)

This document describes the planned Postgres schema for SpaceFlip AI. **Do not apply until explicitly requested.**

## Overview

| Table | Purpose |
|-------|---------|
| `profiles` | User account metadata and subscription quota |
| `design_projects` | Saved design projects shown in Mine |
| `uploaded_photos` | Room photo uploads linked to storage paths |
| `generation_jobs` | Async design generation job lifecycle |
| `generated_designs` | Final AI output images linked to jobs |

---

## `profiles`

```sql
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  is_pro boolean not null default false,
  generations_remaining integer not null default 3,
  generations_used_this_month integer not null default 0,
  quota_reset_at timestamptz,
  total_estimated_cost_this_month numeric(10, 4) default 0,
  trial_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## `design_projects`

```sql
create table public.design_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  room_type text,
  design_style text,
  tool_id text,
  thumbnail_url text,
  input_public_url text,
  result_image_url text,
  job_id uuid references public.generation_jobs (id) on delete set null,
  source text check (source in ('camera', 'gallery', 'demo')),
  status text not null default 'completed' check (status in ('draft', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## `uploaded_photos`

```sql
create table public.uploaded_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  public_url text,
  mime_type text not null default 'image/jpeg',
  width integer,
  height integer,
  source text check (source in ('camera', 'gallery', 'demo')),
  created_at timestamptz not null default now()
);

create index uploaded_photos_user_id_idx on public.uploaded_photos (user_id);
create index uploaded_photos_storage_path_idx on public.uploaded_photos (storage_path);
```

Storage path convention:

```
users/{userId}/inputs/{timestamp}-{fileName}
```

Bucket: `design-inputs`

---

## `generation_jobs`

```sql
create type public.generation_job_status as enum (
  'queued',
  'uploading',
  'processing',
  'completed',
  'failed'
);

create table public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tool_id text not null,
  style_id text,
  input_image_uri text,
  input_storage_path text,
  input_public_url text,
  result_image_url text,
  status public.generation_job_status not null default 'queued',
  source text check (source in ('camera', 'gallery', 'demo')),
  error_message text,
  estimated_cost_cents integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generation_jobs_user_id_idx on public.generation_jobs (user_id);
create index generation_jobs_status_idx on public.generation_jobs (status);
```

---

## `generated_designs`

```sql
create table public.generated_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.design_projects (id) on delete set null,
  job_id uuid not null references public.generation_jobs (id) on delete cascade,
  image_url text not null,
  storage_path text,
  prompt text,
  room_type text,
  design_style text,
  created_at timestamptz not null default now()
);

create index generated_designs_job_id_idx on public.generated_designs (job_id);
```

---

## Row Level Security (RLS)

Enable RLS on all tables:

```sql
alter table public.profiles enable row level security;
alter table public.design_projects enable row level security;
alter table public.uploaded_photos enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.generated_designs enable row level security;
```

### Policy pattern

Users may only read and write their own rows:

```sql
-- Example for generation_jobs
create policy "Users read own jobs"
  on public.generation_jobs for select
  using (auth.uid() = user_id);

create policy "Users insert own jobs"
  on public.generation_jobs for insert
  with check (auth.uid() = user_id);

create policy "Users update own jobs"
  on public.generation_jobs for update
  using (auth.uid() = user_id);
```

Apply the same `auth.uid() = user_id` pattern to all user-owned tables.

---

## Storage RLS notes

- Storage paths must be scoped by user id: `users/{userId}/inputs/...`
- Prefer **private buckets** with signed URLs for production user uploads
- For MVP demo mode, a **public** `design-inputs` bucket is acceptable for testing only
- Never expose service role keys in the mobile app — use anon key + RLS
- AI provider keys belong in Edge Function secrets only

---

## Storage bucket policies (draft)

```sql
-- Allow authenticated users to upload to their own folder
create policy "Users upload own inputs"
  on storage.objects for insert
  with check (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Users read own inputs"
  on storage.objects for select
  using (
    bucket_id = 'design-inputs'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
```

For demo mode without auth, use a public bucket temporarily and migrate to private + signed URLs before production.

---

## Future Edge Function

`create-generation-job` will:

1. Validate user quota
2. Insert `generation_jobs` row
3. Invoke AI provider (OpenAI / Replicate / Stability) server-side
4. Upload result to storage
5. Update job status to `completed` or `failed`

The mobile app should never call AI providers directly.
