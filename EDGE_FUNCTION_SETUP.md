# Edge Function Setup — SpaceFlip Pro

Phase 7 adds the **`generate-upgrade-plan`** Edge Function shell. It reads a `generation_jobs` row, builds a property-focused prompt, and returns a **mock** result URL. No real AI provider is called yet.

**Never put AI keys in the Expo app.** Provider keys belong in Supabase Edge Function secrets (Phase 10).

---

## Prerequisites

- Supabase project linked (spaceflip)
- `generation_jobs` table exists — run `SUPABASE_DATABASE_SETUP.sql`
- `.env` in the mobile app with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Storage upload working (Phase 5)

---

## 1. Install Supabase CLI

**macOS (Homebrew):**

```bash
brew install supabase/tap/supabase
```

**npm (alternative):**

```bash
npm install -g supabase
```

Verify:

```bash
supabase --version
```

---

## 2. Log in and link project

```bash
cd "/Users/beforreal/Desktop/spaceflip AI"
supabase login
supabase link --project-ref tgmmxzyvhiuttmjumwlm
```

Use your project ref from Supabase Dashboard → Settings → General.

---

## 3. Deploy the function

```bash
supabase functions deploy generate-upgrade-plan
```

`supabase/config.toml` sets `verify_jwt = false` for MVP (no auth yet). The app invokes with the **anon** key.

---

## 4. Set secrets (Phase 10 — not required yet)

When you add a real AI provider:

```bash
supabase secrets set OPENAI_API_KEY=sk-...
# or
supabase secrets set REPLICATE_API_TOKEN=r8_...
supabase secrets set AI_PROVIDER=openai
```

The shell uses `mockGenerateUpgradeImage()` until Phase 10 wires `generateUpgradeImage()` to a real provider.

---

## 5. Test from Supabase Dashboard

Dashboard → **Edge Functions** → **generate-upgrade-plan** → **Test**

**Request body:**

```json
{
  "jobId": "YOUR-GENERATION-JOB-UUID",
  "userId": "demo-user"
}
```

Create a job first (Visualize → Continue on device) and copy its `id` from **Table Editor → generation_jobs**.

**Expected response (200):**

```json
{
  "ok": true,
  "jobId": "...",
  "resultImageUrl": "https://images.unsplash.com/...",
  "promptPreview": "SpaceFlip Pro — property upgrade concept request..."
}
```

**Errors:**

| Status | Meaning |
|--------|---------|
| 404 | Job id not found |
| 403 | `userId` does not match job row |
| 400 | Missing `jobId` |
| 500 | DB or server error |

---

## 6. Test from curl

```bash
curl -i "https://tgmmxzyvhiuttmjumwlm.supabase.co/functions/v1/generate-upgrade-plan" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"YOUR-JOB-UUID","userId":"demo-user"}'
```

---

## 7. Test from the iPhone app

1. Deploy the function (step 3)
2. `npm run dev` (keep Metro running)
3. Visualize → project type → photo → Continue
4. **Generating** screen should call the Edge Function when Supabase env is set
5. Metro logs (dev):

```text
[SpaceFlip Pro][AI] Invoking generate-upgrade-plan { jobId, userId }
[SpaceFlip Pro][AI] Edge function success { jobId, resultImageUrl, ... }
```

6. Confirm **Table Editor → generation_jobs** → `status = completed`, `result_image_url` set

If the function is **not deployed**, the app shows:

> Couldn't generate this upgrade plan. Please try again.

Local mock generation still runs when **Supabase env vars are missing**.

---

## Function route

| Item | Value |
|------|--------|
| Name | `generate-upgrade-plan` |
| URL | `{SUPABASE_URL}/functions/v1/generate-upgrade-plan` |
| Method | `POST` |
| Body | `{ "jobId": string, "userId": "demo-user" }` |

---

## Shared code layout

```
supabase/functions/
  generate-upgrade-plan/index.ts   # HTTP handler
  _shared/
    types.ts
    promptBuilder.ts               # buildUpgradePrompt(job)
    aiProvider.ts                  # mockGenerateUpgradeImage() — real AI in Phase 10
```

---

## Typecheck (optional, Deno)

If Deno is installed:

```bash
deno check supabase/functions/generate-upgrade-plan/index.ts
```

Mobile app: `npm run typecheck`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Invoke 404 | Deploy function: `supabase functions deploy generate-upgrade-plan` |
| Job not found | Use UUID from `generation_jobs`, not local `job-...` ids from mock-only mode |
| 403 user mismatch | Pass `"userId": "demo-user"` |
| App uses local mock | Add `.env` Supabase vars and restart with `npm run dev` |
| Function 500 on update | Run `SUPABASE_DATABASE_SETUP.sql` |

---

## Next phases

1. **Auth** — replace `demo-user` with `auth.uid()`
2. **Private storage paths** per user
3. **Real AI** — implement `generateUpgradeImage()` in `aiProvider.ts`
4. **Quotas / paywall** — RevenueCat
