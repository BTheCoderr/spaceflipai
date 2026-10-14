# SpaceFlip Pro — Apple Guideline 2.1 Response Draft

**Review status:** Draft. Do NOT paste into App Store Connect until every `[FILL IN]` value is verified from the newly signed TestFlight build. Apple's June 24, 2026 request concerns version 1.0.0, build 3; do not assume that rejected build contains the fixes in PR #18.

Hello App Review Team,

Thank you for reviewing SpaceFlip Pro. Below is the requested information for your review.

**1. Physical-device screen recording**
Recording: **[FILL IN: public/unlisted viewable URL, no login required]**.
The continuous recording begins with a cold app launch on the submitted TestFlight build and demonstrates onboarding, Continue as guest, New Plan, project type/goal/budget, selecting a property photo (and device permission prompt if shown), generating a plan, the Visual/Plan/Budget/Checklist tabs, saving and reopening a project, PDF export through the iOS share sheet, and Settings → Delete guest workspace and data through final confirmed deletion on a disposable guest workspace.

**2. Tested devices and operating systems**
- iPhone: **[FILL IN: exact model, iOS version, build number]**
- iPad (if supported): **[FILL IN: exact model, iPadOS version, build number]**
- **[FILL IN: any other physical devices actually tested]**
These entries must reflect real tests, not simulator runs or assumed devices.

**3. Purpose, audience, and value**
SpaceFlip Pro is a property-upgrade planning app for short-term rental hosts, landlords, real estate agents, contractors, landscapers, office operators, retail operators, and small-business owners. Users choose a property photo and describe their project goals and budget. The app produces a planning draft containing an upgrade summary, suggested materials, budget guidance, priority checklist, and contractor/client notes. Users can save a plan and export a PDF. This helps organize property improvement decisions and communicate a proposed scope before consulting professionals. Plans are not architectural drawings, final contractor quotes, or professional construction advice. The current review build uses the original property photo; AI-generated remodel/concept images are disabled and are not advertised.

**4. How to access the core functionality**
No test username, password, or personal registration is required. On first launch, choose **Continue as guest**. This creates a private anonymous Supabase workspace. Then:
1. Open **New Plan** and choose a project type.
2. Enter a goal and optional budget.
3. Select a photo with the system photo picker, take a camera photo, or choose a bundled example property photo.
4. Continue to generate an upgrade plan, then review Visual, Plan, Budget, and Checklist.
5. Tap **Save Project**, reopen it in **Projects**, and use **Export PDF**.
6. Open **Settings** to view account/deletion information and exercise **Delete guest workspace and data**.
No special credentials or sample files are necessary, because the app includes example input photos. Guests do not have a password or account recovery. Logging out of an anonymous workspace makes its data inaccessible, so reviewers should use a disposable guest for deletion.

**5. Core external services and device capabilities**
- **Supabase Auth:** anonymous guest identities; **Postgres with RLS:** owner-scoped plans and projects; **private Supabase Storage:** property photos; **Supabase Edge Functions:** plan generation and workspace deletion.
- **Google Gemini / Groq:** server-side AI text generation when configured. A structured template-based plan is used if the text provider is unavailable; the app does not pretend a fallback analyzed the uploaded photograph.
- **Expo / EAS:** native application runtime and build infrastructure.
- **Netlify:** hosts support, privacy, terms and deletion information at https://spaceflippro.netlify.app.
- **Camera:** optional property photo capture (iOS asks for camera access). **Photos:** user-initiated iOS system photo picker; a broad media-library permission is not required just to select a photo.
There is **no in-app purchase, subscription, paywall, advertising, cross-app tracking, public user-content feed, social messaging, reporting/blocking system, contacts access, or location feature** in this release. User photos and notes are private project input rather than public user-generated posts. Deletion is available inside Settings.

**6. Regions**
The same app functionality is available wherever the app is distributed. There are no location-specific feature restrictions or regional accounts. **Budget selection currently shows US-dollar ranges regardless of region**; this is indicative planning guidance, not a localized pricing or quotation service.

**7. Regulated industry and rights**
SpaceFlip Pro is a planning tool, not a licensed construction, appraisal, medical, financial, or government service. It does not claim regulatory authorization or provide regulated advice. It accepts users' own property photographs and includes bundled example photos and illustrative property-category imagery. **[FILL IN: verify source and usage rights for each bundled example asset; document licensed stock imagery; attach permission evidence if requested by Apple. Remove any asset whose rights cannot be established.]** There is no third-party service affiliation implied by the project categories.

Thank you.

---

## Final submission gate

- [ ] PR #18 merged and the intended Supabase deletion function deployed *after* a disposable-user cleanup regression test.
- [ ] New signed iOS production/TestFlight build selected in App Store Connect; the build is **not** 1.0.0 (3).
- [ ] Entire flow verified on physical iPhone (and iPad if supported) on a current OS; record actual models/OS versions.
- [ ] Apple screen recording demonstrates actual final deletion and is viewable without signing in.
- [ ] In-use screenshots match the *same* shipped build and Apple's device-size requirements.
- [ ] Confirm live AI text provider configuration or explicitly remove claims that real AI generated the plan.
- [ ] Example photo / illustration rights fully verified; see `THIRD_PARTY_MEDIA_AUDIT.md`.
- [ ] Support/privacy/terms/deletion links open; App Privacy answers match actual data processing.
- [ ] Replace every `[FILL IN]` before responding in App Store Connect and updating App Review Information → Notes.

Other internal references: `APP_REVIEW_NOTES.md`, `APP_STORE_SUBMISSION_PACK.md`, and `REVIEW_RECORDING_CHECKLIST.md`.
