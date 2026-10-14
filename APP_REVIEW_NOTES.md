# SpaceFlip Pro — App Review Notes

> For a single copy-and-paste reply covering all seven requested items, use `APP_REVIEW_2_1_REPLY.md` after completing its evidence fields. Do not send placeholder device details or a nonexistent recording link. This file is the supporting reference for **App Store Connect → App Review Information → Notes**.

## Screen recording

- **Demo video (public/unlisted, no login required):** `__ADD_LINK_HERE__`
  - Must be viewable without an Apple/Google/login wall (YouTube unlisted, Loom public, or a direct file link all work).
  - See `REVIEW_RECORDING_CHECKLIST.md` for exactly what to capture.

## Devices and OS tested

- `__e.g. iPhone 15 Pro, iOS 18.x__`
- `__e.g. iPad (10th gen), iPadOS 18.x__`

## App purpose and target audience

SpaceFlip Pro is an AI-assisted property upgrade planning app for Airbnb hosts, landlords, realtors, contractors, landscapers, office operators, retail operators, and small businesses.

A user photographs (or selects) a property/space, chooses a project type and goal, and the app generates a structured **planning draft**: an upgrade summary, suggested materials, a budget range, a priority checklist, and contractor notes. Plans can be saved and exported as a PDF to share with clients or contractors.

Important honesty notes for review:
- Plans are **AI-generated planning drafts**, not professional construction documents.
- This build does **not** generate AI design/concept images. The Visual tab and the exported PDF show the user's **own original property photo**, labeled "Property Photo." There is **no mock, stock, or fake generated imagery** anywhere in the review build.
- **Project Guides** (in the "Guides" tab) are not a chatbot. Each guide routes the user into the real New Plan/intake flow to generate a plan.
- There are **no subscriptions, payments, or in-app purchases**, and no paywall is reachable.

## How to test the main features (guest mode — no login required)

1. Launch the app → onboarding slides appear.
2. Tap **Continue as guest**. This silently creates a private, anonymous Supabase workspace (no email/password required).
3. Go to **New Plan** → pick a project type (e.g., "Airbnb / short-term rental").
4. Fill in the goal/budget intake.
5. **Select a photo** from the photo library, or use a built-in **example photo**, or take one with the camera.
6. Tap **Continue** → the app builds an upgrade plan.
7. Review the **Visual** (your original property photo), **Plan**, **Budget**, and **Checklist** tabs.
8. Tap **Save Project**.
9. Open the saved project from the **Projects** tab → **Export PDF** (uses the iOS share sheet).
10. Open **Settings** → review the account card → test **Log out** and/or **Delete guest workspace and data**.

If AI generation is temporarily unavailable, the app still prepares an upgrade plan from the user's project details (no failure screen), and all tabs + PDF export still work. The user's original property photo is always shown.

## External services (active in this build)

- **Supabase Auth** — anonymous guest sessions (the user's workspace identity).
- **Supabase Database (Postgres)** — stores generation jobs and saved projects (per-user via RLS).
- **Supabase Storage** — stores uploaded property photos under `users/{userId}/inputs/`.
- **Supabase Edge Functions** — server-side plan generation and workspace deletion.
- **Google Gemini / Groq** — generate the upgrade plan **text** (server-side only).
- **Expo / EAS** — app runtime and builds.
- **Netlify** — hosts the marketing/support/legal website.

No AI image-generation service is called in this build. (Image generation is not part of the review build and is not advertised in the app.)

No advertising SDKs, no analytics tracking SDKs, no third-party login providers.

## Compliance answers

- **Regional differences:** The same features are offered in each distributed region. Planning budget bands are currently displayed in **US dollars** regardless of region; there is no region-specific pricing or feature unlock.
- **Regulated industry:** Not a licensed/regulated service. Generated plans are drafts, not architecture, permit guidance, engineering, or construction advice.
- **Third-party material:** The app includes bundled example photos and illustrative remote category imagery. Ownership/licensing has **not yet been fully verified**. See `THIRD_PARTY_MEDIA_AUDIT.md`. Verify or replace every unclear asset before claiming Apple has all rights documentation.
- **Payments / subscriptions:** None active. No in-app purchases, no RevenueCat, no Stripe, no paywall is enforced.
- **Forced login:** None. The reviewer can use 100% of features in guest mode.
- **Account creation:** A guest workspace is created automatically and anonymously; no personal account, email, or password is required.

## Guest workspace

- "Continue as guest" creates a private anonymous Supabase user.
- The user's display name/email (optional) are stored locally on-device for display only.
- All saved data is scoped to the anonymous user id and protected by row-level security.

## Data deletion (in-app + web)

- In-app: **Settings → Delete guest workspace and data**. This deletes the user's saved projects, generation jobs, and uploaded photos, then signs out.
- Web: <https://spaceflippro.netlify.app/delete-data>

## URLs

- **Marketing / home:** <https://spaceflippro.netlify.app/>
- **Support:** <https://spaceflippro.netlify.app/support>
- **Privacy Policy:** <https://spaceflippro.netlify.app/privacy>
- **Terms of Use:** <https://spaceflippro.netlify.app/terms>
- **Delete My Data:** <https://spaceflippro.netlify.app/delete-data>
- **Support email:** bferrell514@gmail.com
