# `services/` — Data-Access Layer

This directory is the **only** layer permitted to talk to the Supabase client directly. UI components, hooks, Server Actions, and Route Handlers call functions defined here; they never issue database calls inline.

## Why this layer exists

- **Single seam over the backend.** All reads/writes flow through typed service functions, so Row-Level Security is applied consistently and the rest of the app is decoupled from Supabase specifics.
- **Migration insurance.** If the backend ever changes, the blast radius is contained to this folder (see `docs/architecture/16-Risks.md`, A1 — vendor lock-in).
- **Typed results.** Services return typed data and typed errors (`ActionResult` from `@/types/api`), never throwing across boundaries.

## Rules

1. Only this layer imports the Supabase client.
2. Functions are owner-scoped and RLS-respecting.
3. No UI, no React, no cross-feature business orchestration here — data access only.
4. Return `ActionResult<T>`; surface failures as typed errors.

## Status

Empty by design in the foundation sprint. The first service modules
(`snippets`, `projects`, `devices`) arrive with the Supabase database sprint.

See `docs/architecture/02-Folder-Structure.md` and `08-API-Strategy.md`.
