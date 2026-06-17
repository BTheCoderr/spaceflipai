# SpaceFlip Pro — Build Readiness (MVP / Pre-TestFlight)

This document covers how to run, test, and build SpaceFlip Pro for a private demo or dev/preview build. It also lists what is still mocked and the known limitations.

## What SpaceFlip Pro does (MVP)

Property photo → AI upgrade plan → budget range + materials + priority checklist → client-ready PDF → save as a project.

- **AI plan text:** Generated server-side via a Supabase Edge Function (Groq today; Gemini supported as a provider). Returns structured JSON.
- **Concept image:** **Mocked** (a stock reference image). It is labeled "Concept Reference" everywhere and is **not** a real AI render.
- **PDF export:** Real, via `expo-print` + `expo-sharing`.
- **Persistence:** Supabase (`generation_jobs`, `design_projects`) with a local in-memory fallback.

## Local development

```bash
npm install
npx expo start -c          # -c clears the Metro cache (do this after pulling changes)
```

Then press `i` (iOS simulator), `a` (Android), or scan the QR code with Expo Go / the iOS Camera app.

> After pulling new code, always reload the app (press `r` in the Metro terminal) or restart with `-c`. A stale Metro bundle is the usual cause of "old behavior" on device.

### Environment variables

Root `.env` (Expo, **public only** — gitignored):

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Never put server/AI keys in the Expo app. See `.env.example`.

### Supabase secrets reminder (server-side only)

AI keys live in Supabase Edge Function secrets — never in the app:

```bash
# Local Edge dev values live in supabase/.env.local (gitignored)
supabase secrets set --env-file supabase/.env.local --project-ref <project-ref>
```

Required secrets: `GROQ_API_KEY` (and optionally `GEMINI_API_KEY`), `SUPABASE_SERVICE_ROLE_KEY`.
Optional controls: `GEMINI_DISABLED`, `AI_PROVIDER_PREFERENCE` (`auto` | `gemini` | `groq`).

The Edge Function redacts secrets from logs and falls back to a mock plan if all providers fail.

## How to test the full flow (on device)

1. **Airbnb Unit** → pick a demo/gallery photo → Continue → Generating → Result. Expect `AI-generated plan` (provider `Groq` in dev label).
2. **Backyard / Landscape** → same flow. If AI is unavailable, you should land on Result with a **Demo plan** and a subtle note ("We used a fallback plan…") — **no blocking alert**.
3. **Result → Visual tab** shows **"Concept Reference"** (toggle: Original / Concept), with the planning-reference disclaimer.
4. **Export Plan** → PDF labels the image "Concept Reference", includes the disclaimer, and prints the plan source.
5. **Save Project** → appears under **Saved Projects** in the Projects tab.
6. **Saved Project → detail** → shows plan source/provider, concept disclaimer, working Export.
7. **Delete Project** → confirmation dialog before deleting.
8. **Advisors → tap an advisor** → preview-only screen (intro, example questions, "Start a Visualize Plan"). No fake chat.
9. **Settings** → MVP testing notice; no free-trial / subscription language.

## Clearing Expo cache

```bash
npx expo start -c
# or, if things are really stuck:
rm -rf .expo node_modules/.cache && npx expo start -c
```

## Dev / preview builds (verify native splash & icon outside Expo Go)

> **Why this matters:** Expo Go uses its own app shell, so it will **not** show the custom home-screen icon or the native splash screen. To verify icon/splash/native config you must make a **development** or **preview** build.

EAS profiles are defined in `eas.json`:
- **development** — internal distribution + dev client (`expo-dev-client`); install on a device and connect to the Metro dev server.
- **preview** — internal distribution standalone build (TestFlight-style internal testing, no Metro needed).
- **production** — App Store build later (auto-increments build number).

### Exact commands

```bash
# one-time
npx eas login
npx eas build:configure        # adds extra.eas.projectId to app.json on first run

# iOS development build (dev client)
npx eas build --platform ios --profile development

# iOS preview build (internal, standalone)
npx eas build --platform ios --profile preview

# Android preview build (internal APK/AAB)
npx eas build --platform android --profile preview
```

Convenience npm scripts:

```bash
npm run build:ios:dev
npm run build:ios:preview
npm run build:android:preview
```

### App identifiers (in `app.json`)
- iOS `bundleIdentifier`: `com.spaceflip.pro` (buildNumber `1`)
- Android `package`: `com.spaceflip.pro` (versionCode `1`)
- version `1.0.0`

### TestFlight requirements
- A paid **Apple Developer Program** account.
- An **App Store Connect** app record matching bundle id `com.spaceflip.pro`.
- A signed iOS build (EAS manages credentials), then `npx eas submit --platform ios` (do this manually — not automated here).

### Important caveats for this build
- **Concept/visual images are mocked** — labeled "Concept Reference", not real AI renders.
- **Payments are not active** — no RevenueCat, no subscriptions; the Paywall route is MVP-mode only and unlinked.
- **Auth is not active** — projects use a demo user id.
- Expo Go cannot show the custom icon/splash; use a dev/preview build to verify them.

## What is still mocked

- **Concept/visual image** (stock reference image, labeled "Concept Reference").
- **Payments / subscription** (no RevenueCat, no paywall purchases; the Paywall route is MVP-mode only and not linked from the UI).
- Advisor chat (preview-only, no live responses).
- Some legacy screens (style transfer, painting, tools) are not in the tab navigation.

## Known limitations

- AI plan generation depends on network + provider quota; on failure the app shows a Demo/Fallback plan instead of an error.
- No authentication yet — projects are stored under a demo user id.
- Budget ranges and concept images are planning references, not quotes or final designs.
- Real image generation, auth, and payments are intentionally deferred post-MVP.

## Pre-build checklist

- [ ] `npm run typecheck` passes
- [ ] Root `.env` contains only `EXPO_PUBLIC_*` values
- [ ] `supabase/.env.local` is gitignored and not tracked
- [ ] Supabase secrets set for the target project
- [ ] App reloaded with `-c` so the device runs the latest bundle
