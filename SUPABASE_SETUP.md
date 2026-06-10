# Supabase Setup Checklist

Follow these steps to connect SpaceFlip AI to Supabase Storage. Database tables and AI generation come later.

## 1. Create a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note your **Project URL** and **anon public key** (Settings → API)

## 2. Create the `design-inputs` storage bucket

1. Open **Storage** in the Supabase dashboard
2. Click **New bucket**
3. Name: `design-inputs`
4. For MVP testing: enable **Public bucket** (files get public URLs)
5. For production later: use a **private** bucket with signed URLs + RLS

## 3. Add environment variables

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Fill in:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Never** add:

- `SUPABASE_SERVICE_ROLE_KEY`
- OpenAI, Replicate, or Stability API keys

Those belong in Supabase Edge Function secrets only.

## 4. Restart Expo

Stop Metro (Ctrl+C), then:

```bash
cd "/Users/beforreal/Desktop/spaceflip AI"
npx expo start -c
```

Expo reads `EXPO_PUBLIC_*` vars at build time. A cache clear ensures new values load.

## 5. Test image upload

1. Open the app in Expo Go
2. Go to **Design** → pick any tool
3. Tap **Camera** or **Gallery** and select a photo
4. Tap **Continue**
5. Watch the generating screen — status should progress: queued → uploading → processing → completed

## 6. Verify file in Supabase Storage

1. Open Supabase dashboard → **Storage** → `design-inputs`
2. Look for path: `users/demo-user/inputs/{timestamp}-{fileName}`
3. Confirm the uploaded image appears

If env vars are missing, the app falls back to local mock upload (no file in Supabase).

## 7. Later: create database tables

When ready, apply the SQL draft in `SUPABASE_SCHEMA.md`:

- `profiles`
- `design_projects`
- `uploaded_photos`
- `generation_jobs`
- `generated_designs`

Enable RLS so users can only access their own data.

## 8. Later: Edge Function for AI generation

1. Create Edge Function `create-generation-job`
2. Store AI keys as Supabase secrets
3. Function reads input from `design-inputs`, calls AI provider, saves result
4. Mobile app polls or subscribes to job status — no direct AI calls from the app

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Upload fails with network error | Check device internet; verify Supabase URL/key |
| No file in bucket | Confirm `.env` values and restart Expo with `-c` |
| Permission denied on upload | For public MVP bucket, allow anon uploads or add storage policies |
| App still uses mock upload | Env vars empty or typo in variable names |
| Expo Go works but upload 403 | Bucket may be private — make public for testing or add RLS policies |

## Current MVP behavior

| Feature | Status |
|---------|--------|
| Supabase Storage upload | Wired when env vars set |
| Generation job records | In-memory (DB insert prepared) |
| AI generation | Mocked (Unsplash result URLs) |
| Auth / login | Not required (`demo-user`) |
| RevenueCat | Not connected |
