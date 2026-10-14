# SpaceFlip Pro — Third-Party Media Review Before Apple Resubmission

**Status: licensing provenance incomplete. Do not claim that every bundled asset is owned or licensed until confirmed.** This checklist is for the current Expo app, not just the marketing website.

## Bundled example property photos

`src/data/examplePropertyPhotos.ts` loads the following 16 bundled files from `assets/example-photos/` for the reviewer-accessible guest demo:

| Asset | Source / permission proof | Decision |
| --- | --- | --- |
| living-room.jpg | Not verified | Verify or replace |
| bedroom.jpg | Not verified | Verify or replace |
| kitchen.jpg | Not verified | Verify or replace |
| interior-office.jpg | Not verified | Verify or replace |
| house-front.jpg | Not verified | Verify or replace |
| driveway.jpg | Not verified | Verify or replace |
| patio.jpg | Not verified | Verify or replace |
| garden.jpg | Not verified | Verify or replace |
| open-plan.jpg | Not verified | Verify or replace |
| retail-floor.jpg | Not verified | Verify or replace |
| office-layout.jpg | Not verified | Verify or replace |
| restaurant.jpg | Not verified | Verify or replace |
| cluttered-room.jpg | Not verified | Verify or replace |
| busy-kitchen.jpg | Not verified | Verify or replace |
| furnished-living.jpg | Not verified | Verify or replace |
| furnished-bedroom.jpg | Not verified | Verify or replace |

For every file, record creator/source URL, acquisition date, license terms or written permission, any required attribution, and proof stored privately by the app owner. If rights cannot be established, replace the file with an original or reliably licensed photo before release.

## Remote category photos

`src/data/mockProjectTypes.ts` references ten `images.unsplash.com` URLs for project-category/illustrative imagery. The general Unsplash License permits commercial use, subject to limitations, but **verify each photo's source and applicable license** rather than assuming all remote assets are covered. Unsplash licensing reference: https://unsplash.com/license. If an API is used in a future release, review the separate attribution requirements.

## App Review notes

The app does not redistribute users' private photos to a public feed. AI concept-image generation is not enabled for this submission. The safest review response is to disclose the presence of bundled examples and licensed category images, and to provide evidence only for the rights actually verified. Avoid an unsupported statement that the app contains no third-party material.

## Ship gate

- [ ] All 16 bundled example photos documented or replaced
- [ ] All project-category images documented/licensed or replaced
- [ ] Any third-party marks/logos independently reviewed
- [ ] Final screenshots contain only approved images and current app UI
