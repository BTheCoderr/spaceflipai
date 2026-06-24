# Supabase Storage — Device Test Checklist (SpaceFlip Pro)

Phase 5 tests **Storage upload only**. No auth, database, Edge Functions, or real AI.

---

## Quick device test (exact steps)

### A. Create bucket

Supabase Dashboard → **Storage** → **New bucket**

- **Name:** `design-inputs`
- **Public:** ON (public read for property photos used in plans)

### B. Add `.env`

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Fill in:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Get values from Supabase Dashboard → **Settings** → **API**.

**Never** put service role keys or AI provider keys in the mobile app.

### Security — what goes where

| Secret | Where it belongs | Never in |
|--------|------------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Root `.env` (Expo app) | Git commits |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Root `.env` (Expo app) | Git commits |
| `GEMINI_API_KEY` | Supabase Edge Function secrets | Expo `.env`, client code |
| `GROQ_API_KEY` | Supabase Edge Function secrets (optional) | Expo `.env`, client code |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secrets / server only | Expo app, `EXPO_PUBLIC_*` |

Root `.env` should contain **only** the two `EXPO_PUBLIC_SUPABASE_*` values. Copy from `.env.example`. Server keys use `supabase/.env.example` as a template for local Edge Function dev (`supabase/.env.local`, gitignored).

**Rotate keys immediately** if they appear in screenshots, chat, or commits. Revoke in Google AI Studio / Groq Console / Supabase Dashboard, then set new values with `supabase secrets set` (see `EDGE_FUNCTION_SETUP.md`).

**Real image generation remains mocked** for MVP cost control — AI plan text only via Gemini.

### C. Restart Expo

```bash
cd "/Users/beforreal/Desktop/spaceflip AI"
npx expo start -c
```

In Metro logs (dev only) you should see:

```text
[SpaceFlip Pro] Supabase configured: true
```

If `false`, env vars are missing — the app uses mock upload (no Supabase file).

### D. Test on iPhone

1. Open the app in **Expo Go**
2. **Visualize** → pick any project type
3. Choose a real photo via **Camera** or **Gallery**
4. Select a goal → tap **Continue**

### E. Verify in Supabase Dashboard

Supabase Dashboard → **Storage** → **design-inputs** → browse to:

```text
users/demo-user/inputs/
```

Confirm the uploaded file appears (name pattern: `{timestamp}-{fileName}`).

In Metro logs (dev only) look for:

```text
[SpaceFlip Pro][Storage] Upload started { bucket, storagePath, mimeType, ... }
[SpaceFlip Pro][Storage] Upload success { storagePath, publicUrl }
```

### F. Confirm app continues

**Generating** → **Result** → **Save Project** → **Projects** tab shows saved item.

Mock AI generation still runs after upload — that is expected for Phase 5.

---

## Storage policies (required if upload returns 403)

If Metro shows:

```text
Upload failed … "new row violates row-level security policy" … statusCode: "403"
```

Supabase Storage has RLS enabled but **no insert policy** for your bucket yet. The app and photo read are fine — Supabase is blocking the write.

### Fix (one time)

1. Supabase Dashboard → **SQL Editor**
2. Paste and run **`SUPABASE_STORAGE_SETUP.sql`** from this repo (or the SQL below)
3. Retry Gallery/Camera upload in the app

```sql
-- MVP testing only — tighten before production (Phase 7 Auth)
create policy "MVP anon insert design-inputs"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'design-inputs');

create policy "MVP anon select design-inputs"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'design-inputs');
```

If policies already exist with other names, run the full `SUPABASE_STORAGE_SETUP.sql` (it drops/recreates MVP policies).

---

## Optional: legacy policy snippet

```sql
-- MVP testing only — tighten before production
create policy "Allow public uploads to design-inputs"
on storage.objects for insert
with check (bucket_id = 'design-inputs');

create policy "Allow public read design-inputs"
on storage.objects for select
using (bucket_id = 'design-inputs');
```

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| `Supabase configured: false` | Add `.env` values and run `npx expo start -c` |
| Alert: bucket not found | Create bucket named exactly `design-inputs` |
| Alert: check your connection | Verify iPhone internet + Supabase project URL |
| Upload 403 | Make bucket public or add storage policies above |
| No file in bucket but no error | Confirm you used Camera/Gallery (not demo photo URL only) |
| App works without `.env` | Expected — mock upload fallback |

---

## Database setup (Phase 6)

After Storage upload works, add database persistence for generation jobs and saved projects.

### G. Run database SQL

1. Supabase Dashboard → **SQL Editor**
2. Open `SUPABASE_DATABASE_SETUP.sql` from this repo
3. Paste the full script and click **Run**
4. Confirm tables exist: **Table Editor** → `generation_jobs`, `design_projects`

The script creates:

- `generation_jobs` — one row per Visualize → Continue flow
- `design_projects` — one row per **Save Project** on the Result screen
- Indexes on `user_id`, `status`, `project_type`, `created_at`
- `updated_at` triggers
- MVP RLS policies for `demo-user` only (tighten when Auth is added)

### H. Test database persistence

1. Ensure `.env` has Supabase URL + anon key
2. Restart: `npx expo start -c`
3. **Visualize** → pick project type → photo → goal → **Continue**
4. Supabase **Table Editor** → `generation_jobs` → confirm a new row (`user_id = demo-user`, status progresses to `completed`)
5. Finish **Generating** → **Result** → **Save Project**
6. Supabase **Table Editor** → `design_projects` → confirm a new row linked by `generation_job_id`
7. Open **Projects** tab → saved project card appears (pulls from Supabase on focus)

### I. Troubleshooting (database)

| Issue | What to do |
|-------|------------|
| Alert: database table missing | Run `SUPABASE_DATABASE_SETUP.sql` in SQL Editor |
| Couldn't save this project | Check RLS policies and anon key in `.env` |
| Couldn't load your projects | Confirm `design_projects` exists; tap **Try again** on Projects tab |
| Jobs save but projects don't | Check foreign key / insert errors in Supabase logs |
| No rows without `.env` | Expected — app uses in-memory mock storage |

---

## Current scope

| Feature | Status |
|---------|--------|
| Supabase Storage upload | ✅ When env configured |
| Generation jobs (DB) | ✅ When env + tables configured |
| Saved projects (DB) | ✅ When env + tables configured |
| Auth | Not connected |
| AI plan text | ✅ Edge Function + Gemini secret (Groq optional fallback, mock fallback) |
| AI concept image | Mocked |
| RevenueCat | Not connected |

---

## Phase 9 — AI plan text columns (existing projects)

If you already ran `SUPABASE_DATABASE_SETUP.sql` before Phase 9, add the new columns once:

1. Supabase Dashboard → **SQL Editor**
2. Run:

```sql
alter table public.generation_jobs
  add column if not exists result_payload jsonb default '{}'::jsonb;

alter table public.generation_jobs
  add column if not exists plan_source text default 'mock';

alter table public.generation_jobs
  add column if not exists ai_provider text default 'mock';
```

3. Confirm in **Table Editor → generation_jobs** that `result_payload`, `plan_source`, and `ai_provider` appear.

New installs can run the full updated `SUPABASE_DATABASE_SETUP.sql` (includes these columns).

After a generation completes with the Edge Function deployed:

- `result_payload` — JSON with `upgradeSummary`, `businessOutcome`, `budgetRange`, etc.
- `plan_source` — `ai` when Gemini or Groq text generation succeeds; `mock` otherwise
- `ai_provider` — `gemini`, `groq`, or `mock`

See `EDGE_FUNCTION_SETUP.md` for setting `GEMINI_API_KEY` (and optional `GROQ_API_KEY`) and testing AI text generation.

---

## Later phases (not in this test)

1. Edge Function for real AI — server-side only
2. Auth + RLS — replace `demo-user` text ownership
3. Full schema — see `SUPABASE_SCHEMA.md` for future tables
