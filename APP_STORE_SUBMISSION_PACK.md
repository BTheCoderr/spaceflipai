# SpaceFlip Pro — App Store Submission Pack

Use this as the copy/paste source for the iOS 1.0 submission.

## App identity

- **Name:** SpaceFlip Pro
- **Bundle ID:** `com.spaceflip.pro`
- **Version:** `1.0.0`
- **Production build number:** managed remotely by EAS and auto-incremented. Record the exact TestFlight build selected for review before submission.
- **Suggested primary category:** Business
- **Suggested secondary category:** Productivity

## Subtitle

**Property Upgrade Planner**

## Promotional text

Turn a property photo into a practical upgrade plan with budget guidance, materials, a priority checklist, saved projects, and PDF handoff.

## Keywords

`renovation,landlord,airbnb,realtor,contractor,budget,checklist,pdf,remodel,staging`

Do not add competitor names, unrelated terms, or duplicate words already used in the app name/subtitle.

## Description

SpaceFlip Pro turns property photos and project goals into practical upgrade planning drafts you can save, review, and share.

Start with a property photo, choose the type of space you are improving, add your goal and budget range, and generate a structured plan with:

• Upgrade summary and expected project outcome
• Suggested materials and items
• Budget guidance
• Priority checklist
• Contractor or client notes
• Saved project history
• Client-ready PDF export
• Project Guides for common property and business use cases

Built for Airbnb hosts, landlords, realtors, contractors, landscapers, office operators, retail operators, and small-business owners planning practical property improvements.

The current App Store build uses your original property photo alongside the plan. It does not advertise or present AI-generated remodel images.

SpaceFlip Pro has no subscriptions, payments, or in-app purchases in this release.

Generated plans are planning drafts. Final design, pricing, safety, permit, code, engineering, and construction decisions should be verified with qualified professionals.

## URLs

- **Support:** https://spaceflippro.netlify.app/support
- **Privacy Policy:** https://spaceflippro.netlify.app/privacy
- **User Privacy Choices / Delete Data:** https://spaceflippro.netlify.app/delete-data
- **Marketing:** https://spaceflippro.netlify.app/
- **Terms:** https://spaceflippro.netlify.app/terms

## App privacy — working declaration

App Store Connect must reflect the actual release build and all third-party processing.

### Data SpaceFlip currently handles

- **Photos or Videos / User Content:** property photos uploaded for upgrade planning.
- **Other User Content:** project type, goal, budget range, optional notes, generated plan content, saved project data.
- **Identifiers:** an anonymous Supabase workspace/user identifier is created so backend rows and storage can be scoped to one guest.
- **Diagnostics / request metadata:** limited technical logs may be processed by the backend/provider infrastructure for reliability, security, and troubleshooting.

### Purposes

- App functionality
- Product reliability / troubleshooting where applicable

### Current release does not intentionally collect for these purposes

- Advertising or third-party advertising
- Cross-app or cross-site tracking
- Data brokerage
- Payments or purchase history
- Precise location
- Contacts
- Health or fitness data
- Financial information

### Linkage note

The release does not require a personal account, email address, or password. Backend records are scoped to an anonymous guest identifier. Optional display name/email entered in the app are stored locally on-device for display only under the current implementation.

Before publishing the privacy responses, confirm the exact App Store Connect definition for each selected data type and include third-party partner practices required by Apple.

## Review information

### Sign-in

No reviewer credentials are required.

Use **Continue as guest**. The app silently creates an anonymous Supabase guest workspace.

### Main review path

1. Launch SpaceFlip Pro.
2. Complete onboarding.
3. Tap **Continue as guest**.
4. Open **New Plan**.
5. Choose a project type.
6. Enter a goal and budget.
7. Select a property photo, use a bundled example photo, or take a photo.
8. Generate the upgrade plan.
9. Review **Visual**, **Plan**, **Budget**, and **Checklist**.
10. Tap **Save Project**.
11. Open the saved project in **Projects**.
12. Export the PDF and show the iOS share sheet.
13. Open **Settings**.
14. Show **Delete guest workspace and data** and its confirmation flow.

### External services used by the review build

- Supabase Auth — anonymous guest workspace
- Supabase Postgres — generation jobs and saved projects
- Supabase Storage — private property-photo storage
- Supabase Edge Functions — plan generation and workspace deletion
- Google Gemini and/or Groq — server-side plan-text generation when configured
- Expo / EAS — mobile app build/runtime infrastructure
- Netlify — public marketing/support/privacy/terms/delete-data site

No AI image-generation provider is called in the App Store review build while image generation is disabled.

## Screen recording

**Recording URL:** TO ADD AFTER PHYSICAL-DEVICE RECORDING

Use `REVIEW_RECORDING_CHECKLIST.md` for the exact continuous demo sequence.

## Devices tested

Complete after the final TestFlight smoke test:

- iPhone model: TO ADD
- iOS version: TO ADD
- iPad model / iPadOS version, if tested: TO ADD

## Screenshot order and caption copy

1. **Upload a Property Photo**  
   Start with your space and project goal.

2. **Create an Upgrade Plan**  
   Get a practical summary and contractor-ready notes.

3. **Review Budget and Materials**  
   Keep scope and expected spend organized.

4. **Follow a Priority Checklist**  
   Turn the plan into clear next steps.

5. **Export a PDF Plan**  
   Share a clean handoff with clients or contractors.

6. **Save Your Projects**  
   Keep upgrade plans organized in one place.

7. **Use Project Guides**  
   Start focused plans for common property and business use cases.

## Submission blockers

The repository/build side is prepared. Do not submit until all of these are true:

- Supabase Anonymous Sign-Ins are enabled on the live SpaceFlip project.
- At least one real plan-text provider secret is configured if the release should advertise AI-generated text.
- The full guest → photo → generation → save → reopen → PDF → delete flow passes on a physical iPhone.
- A production/TestFlight build is installed and smoke-tested.
- The Apple review recording URL is added.
- Final App Store screenshots are captured from the production/TestFlight build.
- App Privacy responses in App Store Connect match the final release build.
