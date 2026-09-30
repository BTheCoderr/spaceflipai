# SpaceFlip Pro — Build Readiness (MVP / Pre-TestFlight)

This document covers how to run, test, and build SpaceFlip Pro for a private demo or dev/preview build. It also lists what is still mocked and the known limitations.

## What SpaceFlip Pro does (MVP)

Property photo → AI upgrade plan → budget range + materials + priority checklist → client-ready PDF → save as a project.

- **AI plan text:** Generated server-side via a Supabase Edge Function (Groq today; Gemini supported as a provider). Returns structured JSON.
- **Concept image:** Real image generation is wired but **disabled for the App Store build by default**. When disabled, SpaceFlip shows the user's original **Property Photo** — never a stock/mock image.
- **PDF export:** Real, via `expo-print` + `expo-sharing`.
- **Persistence:** Supabase (`generation_jobs`, `design_projects`) for configured builds. Local in-memory behavior is development-only when Supabase env vars are intentionally absent; configured builds fail closed if a secure guest workspace cannot start.

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

1. **Airbnb Unit** → pick an example/gallery photo → Continue → Generating → Result. Expect `AI-generated plan` (provider `Groq` in dev label).
2. **Backyard / Landscape** → same flow. If AI is briefly unavailable, you still land on Result with an **Upgrade plan** built from your project details — **no blocking alert**, no "demo" wording.
3. **Result → Visual tab** shows the **"Property Photo"** (the uploaded image) with the subtitle "Photo used to create this upgrade plan." No fake concept image, no before/after toggle while real image generation is off.
4. **Export Plan** → PDF labels the image "Property Photo" and includes the planning disclaimer.
5. **Save Project** → appears under **Saved Projects** in the Projects tab.
6. **Saved Project → detail** → shows plan source/provider, "Property Photo" badge, planning disclaimer, working Export.
7. **Delete Project** → confirmation dialog before deleting.
8. **Project Guides → tap a guide** → guide screen (intro, plan prompts, "Start a Visualize Plan"). No chat.
9. **Settings** → no free-trial / subscription language.

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
- **production** — App Store build later. EAS stores the developer-facing build number remotely and auto-increments it for each production build.

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
- iOS `bundleIdentifier`: `com.spaceflip.pro`
- Android `package`: `com.spaceflip.pro`
- user-facing version: `1.0.0`
- local seed values: iOS build `3`, Android versionCode `1`
- production developer-facing build numbers: managed remotely by EAS and auto-incremented

### TestFlight requirements
- A paid **Apple Developer Program** account.
- An **App Store Connect** app record matching bundle id `com.spaceflip.pro`.
- A signed iOS build (EAS manages credentials), then `npx eas submit --platform ios` (do this manually — not automated here).

### Important caveats for this build
- **No AI concept/visual image generation** — the Visual tab and PDF show the user's own
  uploaded **Property Photo**. There is no stock/mock/fake generated imagery.
- **Payments are not active** — no RevenueCat, no subscriptions; there is no Paywall route in the app.
- **Auth** uses anonymous Supabase guest sign-in (Guest Workspace), not a fixed demo user id. Both production Edge Functions require a valid user JWT.
- Expo Go cannot show the custom icon/splash; use a dev/preview build to verify them.

## Not in this build (internal notes)

- **Real AI concept image generation** is wired but OFF. The Visual tab shows the user's
  uploaded **Property Photo**; no stock/mock concept image is shown.
- **Payments / subscription**: none. No RevenueCat, no paywall purchases; the Paywall route
  is removed from the navigation stack.
- **Project Guides** route into the Visualize/intake flow; there is no chat.
- Some legacy screens (style transfer, painting, tools) are not in the tab navigation.

## Known limitations

- AI plan generation depends on network + provider quota; on a brief provider hiccup the app
  still produces an upgrade plan from the user's project details instead of erroring.
- Guest workspaces are stored under an anonymous Supabase user id and can be deleted in Settings. The live project now uses private `design-inputs` storage with owner-scoped policies and signed display/export URLs.
- Budget ranges are planning estimates, not quotes or final designs.

## Production backend privacy

The live SpaceFlip backend is `fslxwcehapelumttwmcf`. It now uses UUID ownership tied to `auth.users`, private `design-inputs` storage, owner-only RLS, and JWT-protected Edge Functions.

For any future fresh SpaceFlip backend, use `SUPABASE_FRESH_PROJECT_SETUP.sql` rather than the older demo-user setup sequence.

The Expo/EAS development, preview, and production build profiles are wired to the live Supabase URL + publishable key. Server-side AI/provider keys remain Supabase Edge Function secrets only.

## Pre-build checklist

- [ ] GitHub `SpaceFlip CI` passes (TypeScript, release identity consistency, Expo compatibility, Expo Doctor, critical dependency audit, marketing build, both Deno Edge Functions)
- [x] EAS development/preview/production profiles contain only the live public Supabase URL + publishable key
- [ ] `supabase/.env.local` is gitignored and not tracked
- [x] Live SpaceFlip Supabase project `fslxwcehapelumttwmcf` is connected and reachable
- [x] Private `design-inputs` storage + owner-scoped RLS applied to the live project
- [x] `generation_jobs.user_id` + `design_projects.user_id` use UUID foreign keys to `auth.users`
- [x] Both Edge Functions deployed with JWT verification enabled
- [ ] At least one real AI text provider secret (`GEMINI_API_KEY` or `GROQ_API_KEY`) configured in Supabase (otherwise plan text safely falls back to template generation)
- [ ] Supabase Anonymous Sign-Ins enabled in Auth settings
- [ ] App reloaded with `-c` so the device runs the latest bundle


## Release versioning guard

SpaceFlip uses two different version concepts:

- `expo.version` / `package.json version` = the user-facing release version, updated deliberately for public releases.
- iOS `buildNumber` / Android `versionCode` = developer-facing build identifiers, managed remotely by EAS and auto-incremented for production builds.

Run `npm run release:check` before a release. CI runs the same check automatically and fails if the app name, version, bundle/package ID, EAS project, live Supabase target, publishable-key alignment, encryption declaration, or App Store submission-pack version drift apart.
