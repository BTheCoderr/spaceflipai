# SpaceFlip AI — MVP User Journey

This document walks through the full mock MVP flow from first launch to upgrade. All AI generation, payments, and cloud sync are simulated locally — no API keys or backend required.

---

## 1. Open app

Launch **SpaceFlip AI** in Expo Go or a dev build. You land on the **Explore** tab with curated inspiration by room type (Living Room, Bedroom, Kitchen, and more).

**What to notice:** Tab bar at the bottom (Explore, Design, AI Tools, Mine). Scroll content clears the tab bar via bottom padding. Images show loading placeholders before Unsplash photos appear.

---

## 2. Choose design mode

Tap the **Design** tab to open the design hub. Three modes are available:

| Mode | Entry point |
|------|-------------|
| **Style Transfer** | Redesign a room photo in a chosen style |
| **Create Painting** | Generate wall art from a text prompt |
| **Commercial / Exterior** | Design cards for patios, offices, staging, etc. |

Each hero card has a **Create** button with a visible press state.

---

## 3. Explore inspiration

On **Explore**, browse horizontal carousels filtered by room category. Tap any inspiration card to open **Style Detail** with the full image, room type, and design style labels.

From Style Detail, tap **Try This Style** to jump into the style transfer flow with room type and style pre-filled.

---

## 4. Select style

In **Style Transfer** (or from Design → Style Transfer):

1. Optionally tap the upload area (mock photo picker alert).
2. Confirm the **Room Type** passed from the previous screen.
3. Pick a design style from the grid (Modern, Scandinavian, Bohemian, etc.). Selected styles show a border highlight.

Style thumbnails use loading placeholders and scale correctly on all iPhone widths (three-column grid, no horizontal overflow).

---

## 5. Upload / select room photo

Tap the dashed upload zone. In the MVP this shows a mock alert — no real camera or gallery integration yet. A mock photo is uploaded in the background when you tap **Generate**.

---

## 6. Mock generate result

Tap **Generate**. The app:

1. Checks free/Pro generation quota (3 free, 100/month on Pro).
2. Creates a mock generation job and navigates to the **Generating** screen with a spinner.
3. Polls job status (~2 seconds) then replaces to the **Result** screen with a mock redesign image.

If quota is exceeded, an alert offers **Upgrade** to the paywall.

---

## 7. Regenerate / save / share

On the **Result** screen:

| Action | Behavior |
|--------|----------|
| **Save** | Saves the design to **Mine → My Projects** (mock persistence in memory) |
| **Share** | Mock share alert |
| **Regenerate** | Starts a new mock job; button shows loading and cannot be double-tapped; respects per-job regenerate limits |
| **Done** | Navigates to the Mine tab |

**Create Painting** follows a similar path: prompt → mock result → Save / Share / Regenerate / Try in Room. Regenerate cycles through mock painting URLs with a brief loading state.

---

## 8. Use AI assistant

Open the **AI Tools** tab. Eleven specialist assistants are listed (Interior Designer, Color Expert, etc.). Tap **Chat** on any card to open a mock conversation with starter messages.

Type a message and tap send — the assistant replies with rotating mock responses. Back navigation works consistently (returns to AI Tools, or Explore if there is no history).

---

## 9. Upgrade from paywall

Pro upsell appears in several places:

- **Mine** tab — Upgrade button on the free plan card
- **Settings** — Get Pro banner and Restore Purchase
- **Quota exceeded** — Alert during generation

The **Paywall** shows benefits, **Start Free Trial** (mock Pro activation), **Restore Purchase**, and **Not now**. Close uses the same back/fallback logic as other stack screens.

After upgrading (mock), Mine shows Pro plan status and increased generation allowance.

---

## Mine tab — saved projects

Open **Mine** to see plan status and **My Projects**. With no saved designs, an empty state explains how to save from the Result screen and offers **Start Designing**.

After saving from Result, projects appear in a two-column grid with image placeholders and metadata.

---

## Quick test checklist

```bash
cd "spaceflip AI"
npm run typecheck
npx expo start
```

1. Explore → tap card → Try This Style → Generate → Result → Save → Mine shows project  
2. Design → Create Painting → Generate → Regenerate (only once while loading)  
3. AI Tools → Chat → send message → back  
4. Mine → Upgrade → Start Free Trial → dismiss  
5. Settings → close button returns to Mine  

---

## Related docs

- `BACKEND_PLAN.md` — Supabase, edge functions, and real AI integration roadmap  
- `.env.example` — Environment variables for future backend wiring  
