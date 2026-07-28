# Contributing to DevSync

Thanks for contributing. This guide covers the workflow and standards. It complements the detailed engineering docs under [`docs/architecture/`](docs/architecture/00-README.md).

## Ground Rules

- **TypeScript is strict.** No `any`; prefer `unknown` + narrowing. Types are inferred from Zod schemas and generated from the database — do not hand-maintain duplicates.
- **Server Components by default.** Add `"use client"` only for interactivity (state, effects, browser APIs, subscriptions). Keep the client boundary as low as possible.
- **Feature-first.** Code that belongs to one feature lives in `features/<name>/`. Promote to a shared folder only on real, second-use reuse. Import other features only via their public surface.
- **Data access only through `services/`.** Never call the Supabase client inline from UI.
- Full details: [`docs/architecture/12-Coding-Standards.md`](docs/architecture/12-Coding-Standards.md).

## Branching

Trunk-based development. Branch from `main` with short-lived branches:

- `feat/<short-desc>` — new capability
- `fix/<short-desc>` — bug fix
- `chore/<short-desc>` — tooling/deps
- `docs/<short-desc>` — documentation
- `refactor/<short-desc>` — non-behavioral change

## Commits — Conventional Commits

```
<type>(<scope>): <imperative summary>
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`, `style`, `build`, `ci`.
Scope matches a feature/area (`snippets`, `auth`, `realtime`, `db`). Example:

```
feat(snippets): add one-click copy with clipboard fallback
```

## Pull Requests

Every change reaches `main` via PR (no direct pushes). A PR must:

1. Be small and focused (one logical change).
2. Pass CI: type-check, lint, format check, and tests.
3. **Produce a successful Vercel preview build** — the preview is the source of truth for "it builds", since the project builds on Vercel first.
4. Describe what changed, why, and how it was verified (include the preview URL).
5. Get at least one approving review (two for auth, RLS, realtime, or sharing changes).
6. Update docs when behavior or architecture changes.

## Before You Open a PR

Reference commands (this repo builds on Vercel; run locally only if your environment allows):

```bash
npm run type-check
npm run lint
npm run format:check
```

## Reporting Issues

Open a GitHub issue with clear reproduction steps, expected vs. actual behavior, and environment details. For security concerns, do not open a public issue — follow responsible disclosure to the maintainers.
