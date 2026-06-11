# Supabase Storage — Device Test Checklist (SpaceFlip Pro)

Phase 5 tests **Storage upload only**. No auth, database, Edge Functions, or real AI.

---

## Quick device test (exact steps)

### A. Create bucket

Supabase Dashboard → **Storage** → **New bucket**

- **Name:** `design-inputs`
- **Public:** ON for MVP testing

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

## Optional: allow anon uploads (if upload returns 403)

For a **public** MVP bucket, add a storage policy in Supabase SQL editor:

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
| AI generation | Mocked |
| RevenueCat | Not connected |

---

## Later phases (not in this test)

1. Edge Function for real AI — server-side only
2. Auth + RLS — replace `demo-user` text ownership
3. Full schema — see `SUPABASE_SCHEMA.md` for future tables
