# SpaceFlip Pro Marketing Site

Static marketing, support, privacy, and terms pages for App Store Connect and public launch.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page |
| `/support` | Support + FAQ |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Use |
| `/delete-data` | Data deletion instructions |

## Local development

```bash
cd marketing
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build

```bash
cd marketing
npm run build
```

Output is written to `marketing/dist/`.

Preview the production build locally:

```bash
npm run preview
```

## Deploy to Vercel

1. Push this repo to GitHub (if not already).
2. Go to [vercel.com](https://vercel.com) → **Add New Project**.
3. Import the repository.
4. Set **Root Directory** to `marketing`.
5. Framework preset: **Vite** (auto-detected).
6. Build command: `npm run build`
7. Output directory: `dist`
8. Deploy.

`vercel.json` in this folder configures SPA routing so `/support`, `/privacy`, and `/terms` work on refresh.

After deploy, update `src/config/site.ts`:

```ts
domain: 'https://your-domain.vercel.app',
```

## Deploy to Netlify

The repo includes a **root** `netlify.toml` that builds the Vite site from `marketing/` automatically.

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**.
2. Connect your Git repository.
3. **Do not** use `expo export -p web` — that is the mobile app, not this site.
4. Either leave Netlify to read root `netlify.toml`, or set manually:
   - **Base directory:** `marketing`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist` (or `marketing/dist` if base is repo root)
5. Deploy.

`marketing/netlify.toml` and root `netlify.toml` configure SPA redirects.

### Netlify build failed with `expo export -p web` / `react-native-web`?

Netlify was pointed at the **Expo mobile app** instead of the marketing site. Fix:

- Remove custom build command `expo export -p web` from the Netlify UI.
- Use base directory `marketing` and build command `npm run build`, **or** commit and push the root `netlify.toml` (already in repo) and trigger **Clear cache and deploy site**.

Do **not** install `react-native-web` unless you want Expo web for the mobile app.

## App Store Connect URLs

After deployment, use:

| Field | URL |
|-------|-----|
| Marketing URL | `https://YOUR_DEPLOYED_DOMAIN/` |
| Support URL | `https://YOUR_DEPLOYED_DOMAIN/support` |
| Privacy Policy URL | `https://YOUR_DEPLOYED_DOMAIN/privacy` |
| Terms URL | `https://YOUR_DEPLOYED_DOMAIN/terms` |

Replace `YOUR_DEPLOYED_DOMAIN` with your Vercel/Netlify domain or custom domain.

## Configuration (update before launch)

Edit `src/config/site.ts`:

| Setting | Purpose |
|---------|---------|
| `domain` | Canonical site URL for docs/references |
| `supportEmail` | Support + legal contact email |
| `supportEmailFuture` | Planned custom domain inbox |
| `appStoreUrl` | App Store listing URL |
| `appStoreLive` | Set `true` when the app is live to enable the download button |
| `effectiveDate` | Privacy/Terms effective date |

## Disclaimers (included on site)

- AI plans are planning drafts — verify pricing, permits, safety, and code with professionals.
- The app shows your original property photo alongside the generated plan.
- No subscriptions, payments, or in-app purchases.
- No free trial, unlimited, or subscription claims.

## TypeScript

```bash
cd marketing
npm run typecheck
```

Root Expo app typecheck (unchanged):

```bash
npm run typecheck
```

From the repository root.
