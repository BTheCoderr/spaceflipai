# Edge Function Setup — SpaceFlip Pro

Phase 9 adds **real AI-generated upgrade plan text** via **Google Gemini** (primary) with optional **Groq** fallback in the `generate-upgrade-plan` Edge Function. Visual concepts remain **mocked** (Unsplash URLs by project type).

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

Root `.env` must **not** contain `GEMINI_API_KEY`, `GROQ_API_KEY`, or `SUPABASE_SERVICE_ROLE_KEY`. Use `supabase/.env.example` → copy to gitignored `supabase/.env.local` for local `supabase functions serve` only.

**If keys were exposed** (screenshot, chat, commit): rotate in [Google AI Studio](https://aistudio.google.com/apikey), [Groq Console](https://console.groq.com/keys), and Supabase if needed. Never paste real keys into docs, commits, or terminal history — use `read -s` (below).

**Image generation stays mocked** for MVP (Unsplash concept URLs). Phase 9 delivers AI photo scan + structured plan text only.

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
6. **Result** screen shows **AI-generated plan** or **Demo plan** under the title
7. In dev builds, a tiny provider label appears (`Gemini` / `Groq` / hidden for mock)
8. Metro logs (dev):

```text
[SpaceFlip Pro][AI] Invoking generate-upgrade-plan { jobId, userId }
[SpaceFlip Pro][AI] Edge function success { jobId, resultImageUrl, planSource: 'ai', aiProvider: 'gemini', ... }
```

9. **Export Plan** PDF header shows *Generated by SpaceFlip Pro AI* or *Demo planning template*
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

## What remains mocked

- **Upgrade concept image** — `generateUpgradeImage()` returns Unsplash URLs by project type
- **Local-only mode** — no Supabase env → in-app mock generation unchanged

---

## Next phases

1. **Auth** — replace `demo-user` with `auth.uid()`
2. **Private storage paths** per user
3. **Real image generation** — wire `generateUpgradeImage()` to Replicate or similar
4. **Quotas / paywall** — RevenueCat
