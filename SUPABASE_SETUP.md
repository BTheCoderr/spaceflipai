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

## Current scope

| Feature | Phase 5 status |
|---------|----------------|
| Supabase Storage upload | ✅ When env configured |
| Generation jobs | In-memory only |
| Database | Not connected |
| Auth | Not connected |
| AI generation | Mocked |
| RevenueCat | Not connected |

---

## Later phases (not in this test)

1. Database tables — see `SUPABASE_SCHEMA.md`
2. Edge Function for real AI — server-side only
3. Auth + RLS — replace `demo-user` paths
