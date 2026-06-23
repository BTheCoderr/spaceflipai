# SpaceFlip Pro — Screen Recording Checklist (Guideline 2.1)

Apple asked for a screen recording that demonstrates the app's full functionality. Record one continuous video that walks through the entire flow below.

## Setup

- [ ] Use a **physical iPhone or iPad** (not the simulator — reviewers want a real device).
- [ ] Update to the **latest available iOS / iPadOS**.
- [ ] Build/run a real build (TestFlight build or `--go` Expo Go is fine for the demo video; a TestFlight build is best).
- [ ] Make sure you have at least one photo in the Photo Library, or plan to use the in-app demo photo.
- [ ] Use a **fresh / test guest workspace** so the delete step at the end is safe.
- [ ] Turn on screen recording (Control Center) and ensure there is **no personal info** visible.

## Record this flow (in order)

- [ ] Start recording **from app launch** (cold start).
- [ ] Show the **onboarding** slides.
- [ ] Tap **Continue as guest**.
- [ ] Land on **Projects** (empty state is fine).
- [ ] Open **Visualize**.
- [ ] Choose a **project type** (e.g., Airbnb / short-term rental).
- [ ] Complete the **project intake** (goal, budget).
- [ ] Trigger the **photo permission prompt** if it appears, then **select or upload a photo** (or use the demo photo).
- [ ] Tap **Generate** and let the plan build.
- [ ] Show all result tabs: **Visual**, **Plan**, **Budget**, **Checklist**.
- [ ] Tap **Save Project**.
- [ ] Go to **Projects** and **open the saved project**.
- [ ] Tap **Export PDF** and show the iOS share sheet / PDF preview.
- [ ] (Optional) Open an **Advisor** to show the preview screen.
- [ ] Open **Settings**.
- [ ] Show the **account card** (Guest workspace + short ID + "no password required").
- [ ] Show **Log out** exists.
- [ ] Show **Delete guest workspace and data** → tap it → show the confirmation modal.
  - [ ] Only actually confirm the delete **at the very end** (or on a throwaway test workspace), since it cannot be undone.
- [ ] Stop recording.

## After recording

- [ ] Upload to a **public or unlisted** link that opens **without any login** (YouTube unlisted, Loom public, Google Drive "anyone with link", or a direct .mp4/.mov URL).
- [ ] Paste that link into `APP_REVIEW_NOTES.md` and into App Store Connect's Guideline 2.1 reply.

## Tips

- Keep it under ~3–4 minutes; narrate or add captions if helpful.
- If AI generation falls back to a demo planning draft during recording, that's fine — it demonstrates the resilience and still shows every screen.
