# Edge Function Setup — SpaceFlip Pro

The `generate-upgrade-plan` Edge Function produces **real AI-generated upgrade plan text** via **Google Gemini** (primary) with optional **Groq** fallback. When real concept-image generation is OFF (the App Store build default), the Visual tab shows the user's **original property photo** — no stock/mock concept image is used.

**Never put AI keys in the Expo app.** Provider keys belong in Supabase Edge Function secrets only.

---

## Security — server-only secrets

| Variable | Location | Notes |
|----------|----------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | Root `.env` | Public; safe for Expo |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Root `.env` | Public; safe for Expo |
| `GEMINI_API_KEY` | **Supabase Edge Function secrets only** | Primary AI plan text |
| `GROQ_API_KEY` | **Supabase Edge Function secrets only** | Optional text fallback |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secrets / server only | **Never** in Expo or client code |
| `REPLICATE_API_TOKEN` | **Supabase Edge Function secrets only** | Phase 18 image gen (Replicate FLUX) |
| `STABILITY_API_KEY` | **Supabase Edge Function secrets only** | Phase 18 image gen (Stability fallback) |

Root `.env` must **not** contain `GEMINI_API_KEY`, `GROQ_API_KEY`, or `SUPABASE_SERVICE_ROLE_KEY`. Use `supabase/.env.example` → copy to gitignored `supabase/.env.local` for local `supabase functions serve` only.

**If keys were exposed** (screenshot, chat, commit): rotate in [Google AI Studio](https://aistudio.google.com/apikey), [Groq Console](https://console.groq.com/keys), and Supabase if needed. Never paste real keys into docs, commits, or terminal history — use `read -s` (below).

**Image generation is mocked by default.** Real AI concept images (Phase 18) are gated behind `IMAGE_GENERATION_ENABLED` + a provider key — see the Phase 18 section below.

---

## Prerequisites

- Supabase project linked (spaceflip)
- `generation_jobs` table exists — run `SUPABASE_DATABASE_SETUP.sql`
- Phase 9 columns on `generation_jobs`: `result_payload`, `plan_source`, `ai_provider` (see `SUPABASE_SETUP.md`)
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

## 3. Set AI secrets

After rotating keys, set secrets **without** echoing values to shell history:

### Gemini (primary — free tier)

1. Create a new key in [Google AI Studio](https://aistudio.google.com/apikey)
2. Set the secret (prompt is hidden):

```bash
read -s GEMINI_API_KEY
supabase secrets set GEMINI_API_KEY="$GEMINI_API_KEY" --project-ref tgmmxzyvhiuttmjumwlm
unset GEMINI_API_KEY
```

### Groq (optional fallback)

If Gemini is missing or fails, the function tries Groq when configured:

```bash
read -s GROQ_API_KEY
supabase secrets set GROQ_API_KEY="$GROQ_API_KEY" --project-ref tgmmxzyvhiuttmjumwlm
unset GROQ_API_KEY
```

Verify secrets (names only — values are hidden):

```bash
supabase secrets list
```

**Without either secret:** the function still succeeds with `planSource: "mock"`, `aiProvider: "mock"`, and template plan text. No crash.

**Do not** run `supabase secrets set GEMINI_API_KEY=...` with the key inline — that stores the key in shell history.

---

## 4. Deploy the function

Deploy **after** setting secrets (or redeploy after adding secrets):

```bash
supabase functions deploy generate-upgrade-plan --project-ref tgmmxzyvhiuttmjumwlm
```

`supabase/config.toml` sets `verify_jwt = false` for MVP (no auth yet). The app invokes with the **anon** key.

---

## 5. Test AI text generation

### A. Supabase Dashboard

Dashboard → **Edge Functions** → **generate-upgrade-plan** → **Test**

**Request body:**

```json
{
  "jobId": "YOUR-GENERATION-JOB-UUID",
  "userId": "demo-user"
}
```

Create a job first (Visualize → Continue on device) and copy its `id` from **Table Editor → generation_jobs**.

**Expected response (200) with Gemini configured:**

```json
{
  "ok": true,
  "jobId": "...",
  "resultImageUrl": "https://images.unsplash.com/...",
  "resultPayload": {
    "upgradeSummary": "...",
    "businessOutcome": "...",
    "budgetRange": "$2,500 – $7,500",
    "suggestedMaterials": ["..."],
    "priorityChecklist": ["..."],
    "contractorNotes": "...",
    "riskNotes": ["..."],
    "photoPrepTips": ["..."]
  },
  "planSource": "ai",
  "aiProvider": "gemini",
  "estimatedCostCents": 0,
  "promptPreview": "SpaceFlip Pro — property upgrade concept request..."
}
```

**Without `GEMINI_API_KEY` or `GROQ_API_KEY`:** same shape with `planSource: "mock"`, `aiProvider: "mock"`, and template plan text.

**With Groq only (no Gemini):** `planSource: "ai"`, `aiProvider: "groq"`.

### B. curl

```bash
curl -i "https://tgmmxzyvhiuttmjumwlm.supabase.co/functions/v1/generate-upgrade-plan" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"YOUR-JOB-UUID","userId":"demo-user"}'
```

---

## 6. Verify `generation_jobs` columns

After a successful run:

1. Supabase Dashboard → **Table Editor** → **generation_jobs**
2. Open the completed row
3. Confirm:
   - `status` = `completed`
   - `result_image_url` = mock Unsplash URL
   - `result_payload` = JSON object with plan fields (not `{}` after generation)
   - `plan_source` = `ai` or `mock`
   - `ai_provider` = `gemini`, `groq`, or `mock`
   - `estimated_cost_cents` = `0`

**How to tell `plan_source` and `ai_provider`:**

| `plan_source` | `ai_provider` | Meaning |
|---------------|---------------|---------|
| `ai` | `gemini` | Gemini returned valid JSON plan text |
| `ai` | `groq` | Gemini missing/failed; Groq returned valid JSON |
| `mock` | `mock` | No API keys, or all providers/parse failed — mock template used |

Function logs (Dashboard → Edge Functions → Logs) show warnings when falling back to mock.

---

## 7. Test from the iPhone app

1. Run Phase 9 SQL columns if needed (`SUPABASE_SETUP.md`)
2. Set `GEMINI_API_KEY` secret and deploy the function
3. `npm run dev` (keep Metro running)
4. Visualize → project type → photo → Continue
5. **Generating** screen calls the Edge Function when Supabase env is set
6. **Result** screen shows **AI-generated plan** or **Upgrade plan** under the title
7. In dev builds, a tiny provider label appears (`Gemini` / `Groq` / hidden for mock)
8. Metro logs (dev):

```text
[SpaceFlip Pro][AI] Invoking generate-upgrade-plan { jobId, userId }
[SpaceFlip Pro][AI] Edge function success { jobId, resultImageUrl, planSource: 'ai', aiProvider: 'gemini', ... }
```

9. **Export Plan** PDF header shows *Generated by SpaceFlip Pro AI* or *Property upgrade plan*
10. **Save Project** still persists to `design_projects`

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
    types.ts                       # UpgradePlanPayload, response types
    promptBuilder.ts               # buildUpgradePrompt(job)
    aiProvider.ts                  # generateUpgradePlanText() + mock image
```

Provider chain in `aiProvider.ts`:

1. `generateWithGemini()` — primary (free tier, e.g. `gemini-2.0-flash`)
2. `generateWithGroqOptional()` — secondary when `GROQ_API_KEY` is set
3. `mockGenerateUpgradePlanText()` — always succeeds

---

## Typecheck (optional, Deno)

If Deno is installed:

```bash
npm run functions:check
```

Mobile app:

```bash
npm run typecheck
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Invoke 404 | Deploy function: `supabase functions deploy generate-upgrade-plan --project-ref tgmmxzyvhiuttmjumwlm` |
| Job not found | Use UUID from `generation_jobs`, not local `job-...` ids from mock-only mode |
| 403 user mismatch | Pass `"userId": "demo-user"` |
| App uses local mock | Add `.env` Supabase vars and restart with `npm run dev` |
| Function 500 on update | Run Phase 9 SQL for `result_payload` / `plan_source` / `ai_provider` columns |
| Always `plan_source = mock` | Set `GEMINI_API_KEY` secret and redeploy; check Edge Function logs |
| `result_payload` is `{}` | Row created before generation — run a new Visualize flow |
| Gemini quota / 429 | Function falls back to Groq (if set) then mock; check Google AI Studio limits |

---

## Phase 18 — Real AI concept image generation (OFF by default)

The `generate-upgrade-plan` function can generate a real **AI Concept Reference**
from the user's uploaded photo (image-to-image).
**It is disabled until you set a provider key and `IMAGE_GENERATION_ENABLED=true`.**
When off (the App Store build default), no stock/mock image is used: `concept_image_url`
is null, `image_provider` is `none`, and `result_image_url` is the user's original photo.

### 1. Run the DB migration

Supabase Dashboard → SQL Editor → run **`SUPABASE_IMAGE_GENERATION_MIGRATION.sql`**.
Adds `concept_image_url`, `image_provider`, `image_generation_status`,
`image_generation_error`, `estimated_image_cost_cents` to `generation_jobs`.

### 2. Add the provider secret (server only)

Replicate (recommended — FLUX Kontext image editing):

```bash
read -s REPLICATE_API_TOKEN
supabase secrets set REPLICATE_API_TOKEN="$REPLICATE_API_TOKEN" --project-ref tgmmxzyvhiuttmjumwlm
unset REPLICATE_API_TOKEN
```

Or Stability (fallback):

```bash
read -s STABILITY_API_KEY
supabase secrets set STABILITY_API_KEY="$STABILITY_API_KEY" --project-ref tgmmxzyvhiuttmjumwlm
unset STABILITY_API_KEY
```

### 3. Turn it on (only after the key is set + you approve)

```bash
supabase secrets set IMAGE_GENERATION_ENABLED=true --project-ref tgmmxzyvhiuttmjumwlm
supabase secrets set IMAGE_GENERATION_PROVIDER=replicate --project-ref tgmmxzyvhiuttmjumwlm
# optional soft cost guard (default 5):
supabase secrets set MAX_IMAGE_GENERATIONS_PER_USER_PER_DAY=5 --project-ref tgmmxzyvhiuttmjumwlm
```

Redeploy the function (or paste `dashboard-single-file.ts`, version `phase18-image-v1`).

### How it works

1. Plan text is generated by Groq/Gemini exactly as before.
2. If enabled, the function builds an image-editing prompt from project type, goal,
   budget, notes, and the plan summary, then sends the **original photo URL** to the
   provider (FLUX Kontext preserves layout/camera angle).
3. The generated PNG is stored at `users/{uid}/outputs/{jobId}/concept.png` (service
   role) and `result_image_url` is set to its public URL.
4. On any failure (or when image generation is disabled) the function does **not** use a
   stock/mock image: `concept_image_url` stays null, `image_provider` is `none`, and
   `result_image_url` is set to the user's original photo — the user sees the
   **Property Photo** copy.

### Cost guards

- One real image per generation job.
- `MAX_IMAGE_GENERATIONS_PER_USER_PER_DAY` (default 5) — counted from completed image jobs.
- `estimated_image_cost_cents` recorded per job (~4¢ per FLUX Kontext / Stability image).

### Labels

- Result badge: **AI Concept Reference** (real generated image) vs **Property Photo** (no real concept image).
- PDF image label: **AI Concept Reference** (real) vs **Property Photo** (no real concept image), with the disclaimer
  "Generated plans are planning drafts. Final design, pricing, safety, permits, and construction
  decisions should be verified with qualified professionals."

---

## Behavior when image gen is OFF (App Store default)

- **No concept image** — `concept_image_url` is null, `image_provider` is `none`, and
  `result_image_url` is set to the user's original property photo (no Unsplash/stock image).
- **Local-only mode** — no Supabase env → in-app plan generation falls back to the user's
  original photo as the visual, never a stock image.

---

## Next phases

1. ~~**Auth** — replace `demo-user` with `auth.uid()`~~ ✅ done (Phase 16)
2. ~~**Private storage paths** per user~~ ✅ done (Phase 16)
3. ~~**Real image generation**~~ ✅ done (Phase 18, gated by `IMAGE_GENERATION_ENABLED`)
4. **Quotas / paywall** — out of scope for MVP (no RevenueCat / subscriptions)
