# SpaceFlip Pro

<!-- repo-intro:start -->
**Project snapshot:** SpaceFlip Pro is an Expo/React Native property-upgrade planning app that turns project intake and property photos into saved design projects, structured upgrade plans, optional AI-generated concepts, and actionable checklists.

**What it demonstrates:** Expo/React Native · TypeScript · Supabase Auth/Postgres/Storage/RLS · Edge Functions · AI-provider fallbacks · private media handling.
<!-- repo-intro:end -->

## Product flow

SpaceFlip Pro helps a user move from an idea for a space to a structured project:

1. Complete onboarding and create a workspace identity.
2. Start a design/project intake.
3. Add project goals, budget context, notes, and property photos.
4. Generate an upgrade plan through the server-side generation flow.
5. Save projects, checklists, budget items, summaries, and contractor notes.
6. Re-open projects and export/share plan output.

## Backend architecture

The Supabase backend intentionally keeps a small trusted surface:

- `generation_jobs` — generation requests and generated plan data
- `design_projects` — saved user projects
- private `design-inputs` storage — property photos and optional generated concepts
- owner-scoped RLS using authenticated/anonymous Supabase sessions
- `generate-upgrade-plan` Edge Function for structured plan generation
- `delete-user-workspace` Edge Function for account/workspace cleanup

AI generation can use configured providers with deterministic fallbacks when a provider is unavailable.

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- Supabase Auth, Postgres, Storage, RLS, and Edge Functions
- EAS build tooling

## Local development

```bash
npm install
npm start
```

See `SUPABASE_SETUP.md`, `SUPABASE_SCHEMA.md`, and the SQL setup/migration files before connecting a fresh backend.

## Security model

Private user photos are stored in owner-scoped paths and resolved through short-lived signed URLs where needed. Service-role and AI-provider secrets stay server-side and are never shipped in the Expo client.
