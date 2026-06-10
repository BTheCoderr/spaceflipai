# SpaceFlip AI — Backend Plan

This document describes how to connect the Expo mobile app to Supabase, AI providers, and RevenueCat. **No AI API keys belong in the mobile app.**

---

## Architecture Overview

```
Mobile App
  → upload photo to Supabase Storage (room-photos)
  → POST edge function create-generation-job (JWT)
  → poll get-generation-status
  → display signed URL from generated-designs

Edge Function (secrets: OPENAI_API_KEY, REPLICATE_API_TOKEN)
  → validate quota + regenerate limits
  → promptBuilder.build()
  → AI provider adapter
  → save output to Storage + update generation_jobs
```

Mobile env vars (`.env`):

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_BASE_URL` (optional)
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`

Edge secrets (Supabase dashboard only):

- `OPENAI_API_KEY`
- `REPLICATE_API_TOKEN`
- `AI_PROVIDER` (`openai` | `replicate`)
- `REPLICATE_MODEL`

---

## 1. Supabase Tables

### profiles

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | FK → auth.users |
| email | text | |
| display_name | text | |
| plan | text | `free` \| `pro` |
| generations_remaining | int | free: 3 total; pro: up to 100/month |
| generations_used_this_month | int | |
| quota_reset_at | timestamptz | pro monthly reset |
| total_estimated_cost_this_month | numeric | admin analytics |
| created_at | timestamptz | |

### design_projects

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid FK → profiles |
| title | text |
| room_type | text |
| design_style | text |
| thumbnail_url | text |
| status | text |
| created_at | timestamptz |
| updated_at | timestamptz |

### uploaded_photos

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid FK |
| storage_path | text |
| mime_type | text |
| width | int |
| height | int |
| created_at | timestamptz |

### generation_jobs

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid FK |
| project_id | uuid FK nullable |
| type | text | `style_transfer` \| `painting` |
| status | text | `queued` \| `processing` \| `completed` \| `failed` |
| input_photo_id | uuid FK nullable |
| input_photo_storage_path | text |
| output_storage_path | text |
| room_type | text |
| design_style | text |
| prompt_text | text |
| prompt_params | jsonb |
| result_url | text |
| error | text |
| provider_name | text |
| estimated_provider_cost | numeric |
| prompt_token_estimate | int |
| parent_job_id | uuid nullable |
| regenerate_count | int |
| created_at | timestamptz |
| processing_started_at | timestamptz |
| completed_at | timestamptz |

### generated_designs

| Column | Type |
|--------|------|
| id | uuid PK |
| project_id | uuid FK |
| job_id | uuid FK |
| image_url | text |
| prompt | text |
| room_type | text |
| design_style | text |
| created_at | timestamptz |

**RLS:** Users can only read/write their own rows (`user_id = auth.uid()`).

---

## 2. Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `room-photos` | User read/write own folder | Original uploads from mobile |
| `generated-designs` | User read; service role write | AI output images |
| `painting-outputs` | User read; service role write | Painting generation (future) |

Path convention: `{user_id}/{uuid}.{ext}`

---

## 3. Edge Functions

| Function | Method | Role |
|----------|--------|------|
| `create-generation-job` | POST | Quota check, build prompt, call AI, save result |
| `get-generation-status` | GET | Return job + signed result URL |
| `regenerate-design` | POST | Enforce cooldown + max 2 regenerates |
| `generation-webhook` | POST | Replicate async callback |
| `moderate-upload` | POST | Pre-flight image safety scan |
| `sync-subscription` | POST | RevenueCat webhook → update profile |

Deploy shared AI code from `src/lib/ai/` to `supabase/functions/_shared/ai/`.

---

## 4. AI Provider Abstraction

Location: `src/lib/ai/`

| File | Purpose |
|------|---------|
| `types.ts` | `PromptParams`, `AIImageProvider`, task/style/constraint unions |
| `promptBuilder.ts` | `buildPrompt()`, `validatePromptParams()`, `mapRoomTypeToPromptParams()` |
| `providers/openaiImageProvider.ts` | OpenAI Images API adapter |
| `providers/replicateProvider.ts` | Replicate predictions adapter |
| `examples/promptExamples.ts` | 8 reference prompts for QA |

Switch provider via edge secret `AI_PROVIDER`. Both adapters implement:

- `estimateCostUsd(input)` — stored on each job
- `generate(input)` — returns image URL + cost

**Example prompts** (see `promptExamples.ts`):

1. Airbnb bedroom staging
2. Commercial office layout
3. Small retail display
4. Backyard landscaping
5. Living room redesign
6. Declutter and cleanup
7. Replace sofa
8. Rearrange furniture

---

## 5. Payment / Subscription Strategy

| Plan | Generations | Reset |
|------|-------------|-------|
| Free | 3 total | On upgrade only |
| Pro | 100 / month | 1st of each month |

- **Client:** RevenueCat SDK with public keys only
- **Server:** `sync-subscription` webhook updates `profiles.plan` and quota
- **Enforcement:** Edge function checks quota before AI call (source of truth)
- **Mock (current):** `src/lib/payments.ts` mirrors limits locally

---

## 6. Safety and Moderation Strategy

1. **Upload validation:** Max 10MB, JPEG/PNG/WebP only
2. **Pre-generation moderation:** Run `moderate-upload` on storage path before AI call
3. **Prompt filtering:** Block unsafe renovation instructions (structural demolition, etc.)
4. **Output review:** Optional post-generation NSFW classifier on result
5. **Rate limiting:** Max 10 job creates per user per hour
6. **Audit log:** Store moderation failures in `moderation_events` table (future)

---

## 7. Cost Control

- Each job stores `estimated_provider_cost` (USD)
- `profiles.total_estimated_cost_this_month` for admin dashboards
- Regenerate policy (server + mock):
  - Max **2** regenerates per job chain
  - **30s** cooldown between regenerates
  - Each regenerate consumes 1 generation from quota

---

## 8. MVP Release Checklist

- [ ] Supabase project created; migrations applied
- [ ] RLS policies tested (users cannot access others' data)
- [ ] Storage buckets + policies configured
- [ ] Edge secrets set (no keys in mobile bundle)
- [ ] `create-generation-job` deployed and tested
- [ ] `get-generation-status` returns signed URLs
- [ ] Quota enforced server-side (free 3, pro 100/month)
- [ ] Regenerate limits tested
- [ ] RevenueCat products + webhook linked
- [ ] EAS env vars configured for Expo public keys
- [ ] End-to-end style transfer on physical device
- [ ] App Store privacy nutrition labels updated

---

## 9. Implementation Order

1. Install `@supabase/supabase-js` in Expo; wire `getSupabaseClient()`
2. Add Supabase Auth (email or Apple Sign In)
3. Deploy SQL migrations
4. Copy `src/lib/ai/*` to edge function shared folder
5. Deploy `create-generation-job` + `get-generation-status`
6. Add `expo-image-picker` for real photo uploads
7. Integrate RevenueCat; replace mock payments
8. Enable production AI provider + moderation
