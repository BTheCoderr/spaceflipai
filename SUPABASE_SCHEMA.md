# Supabase Schema — Current Production

SpaceFlip Pro currently uses a deliberately small backend:

| Resource | Purpose |
|---|---|
| `auth.users` | Anonymous guest workspace identity |
| `public.generation_jobs` | Property-photo generation requests and generated upgrade-plan data |
| `public.design_projects` | Saved SpaceFlip projects |
| `storage.objects` / `design-inputs` | Private property photos and optional generated concept images |

The live project is `fslxwcehapelumttwmcf`.

## Ownership model

Both application tables use:

```sql
user_id uuid not null references auth.users(id) on delete cascade
```

Anonymous Supabase users are authenticated sessions and therefore use the Postgres `authenticated` role. RLS always combines that role with `user_id = (select auth.uid())`.

The unauthenticated `anon` role has no table privileges on SpaceFlip application tables.

## generation_jobs

Important fields:

- `id uuid`
- `user_id uuid` → `auth.users(id)`
- project intake: `project_type`, `goal`, `budget_range`, `notes`
- photo references: `input_image_uri`, `input_storage_path`, `input_public_url`
- result: `result_image_url`, `result_payload`
- plan metadata: `plan_source`, `ai_provider`, `estimated_cost_cents`
- concept-image metadata: `concept_image_url`, `image_provider`, `image_generation_status`, `image_generation_error`, `estimated_image_cost_cents`
- lifecycle: `status`, `error_message`, timestamps

Indexes cover user ownership, status, and user/date queries.

## design_projects

Important fields:

- `id uuid`
- `user_id uuid` → `auth.users(id)`
- `generation_job_id uuid` → `generation_jobs(id)`
- intake/result fields used by the saved-project experience
- `checklist jsonb`
- `budget_items jsonb`
- `plan_summary`
- `contractor_notes`
- timestamps

The insert/update RLS policy also checks that any referenced `generation_job_id` belongs to the same authenticated user.

## Storage

Bucket: `design-inputs`

Production state:

- private bucket
- no broad anonymous read access
- owner-scoped INSERT / SELECT / UPDATE / DELETE policies
- path convention: `users/{auth.uid()}/inputs/...`
- generated concepts, when enabled: `users/{auth.uid()}/outputs/{jobId}/concept.png`
- persisted rows keep stable storage references
- display, PDF export, and AI-provider access resolve private files through short-lived signed URLs

## Edge Functions

### generate-upgrade-plan

- requires a valid JWT
- derives identity from the JWT, never from a client-supplied user id
- verifies that the requested generation job belongs to the caller
- generates structured plan text through Gemini or Groq when configured
- falls back to deterministic template plan text if providers are unavailable
- concept image generation is wired but disabled by default

### delete-user-workspace

- requires a valid JWT
- deletes only the authenticated user's projects, jobs, and storage objects
- removes the anonymous Auth user as a best-effort final step

## Setup files

For a brand-new backend, use:

`SUPABASE_FRESH_PROJECT_SETUP.sql`

The older `SUPABASE_DATABASE_SETUP.sql`, `SUPABASE_AUTH_MIGRATION.sql`, and `SUPABASE_PRIVATE_STORAGE_MIGRATION.sql` files are retained only for legacy upgrade paths.

Never place service-role or AI-provider secrets in the Expo app.
