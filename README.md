# SpaceFlip Pro

<!-- repo-intro:start -->
**Project snapshot:** SpaceFlip Pro is a mobile home-improvement planning app that turns property photos and project intake into saved design projects, structured upgrade plans, concept-generation workflows, checklists, budgets, and contractor-ready notes.

**What it demonstrates:** Expo/React Native · TypeScript · Supabase Auth/Postgres/Storage/RLS · Edge Functions · image/AI workflow architecture.
<!-- repo-intro:end -->

## Product experience

SpaceFlip Pro is built around a project workspace rather than a one-off image generator.

- Guided project intake for property goals, budget, photos, and notes
- Saved design projects and generation history
- Structured upgrade plans with plan summaries and contractor notes
- Checklist and budget-item persistence
- Private photo storage with signed access
- AI-assisted plan generation with deterministic fallback behavior
- Concept-image generation architecture
- Advisor/assistant workflows
- PDF/print and sharing support
- User workspace deletion and privacy controls

## Backend model

Supabase provides authenticated workspace ownership, Postgres persistence, private Storage, Row Level Security, and Edge Functions.

The application tables and storage paths are owner-scoped. Server-side functions derive identity from the caller's JWT rather than trusting a client-supplied user ID.

See `SUPABASE_SCHEMA.md` and the setup/migration files for backend details.

## Stack

- Expo SDK 54
- React Native 0.81
- React 19 + TypeScript
- Expo Router
- Supabase Auth, Postgres, Storage, RLS, and Edge Functions
- Expo image picker/manipulation, print, and sharing APIs

## Local development

```bash
npm install
npm run dev
```

Useful validation:

```bash
npm run typecheck
npm run functions:check
npm run release:check
```

Provider and service secrets belong in server/deployment configuration, never in the Expo client.
