# DevSync — Technical Architecture

> **Tagline:** Copy Once. Debug Anywhere.
> **Status:** Architecture draft v1.0 · **Last updated:** 2026-07-22
> **Prerequisite:** The [Product Blueprint](../00-README.md) (PRD et al.) is approved. This set defines *how* we build what the PRD specifies.

This directory is the **technical architecture** for DevSync. It is the bridge between the approved product blueprint and implementation. It contains **no application code, no SQL scripts, no API implementations, and no framework configuration files** — only architecture, reasoning, and specifications detailed enough for a senior team to begin building immediately.

---

## Document Index

| # | Document | Purpose |
|---|----------|---------|
| 01 | [High-Level Architecture](01-High-Level-Architecture.md) | The whole system and how its parts interact. |
| 02 | [Folder Structure](02-Folder-Structure.md) | Feature-based structure + ownership rules. |
| 03 | [Component Architecture](03-Component-Architecture.md) | Component tiers, naming, reuse strategy. |
| 04 | [State Management](04-State-Management.md) | Global/local/server state, caching, realtime. |
| 05 | [Authentication Architecture](05-Authentication-Architecture.md) | Login, sessions, middleware, multi-device. |
| 06 | [Database Strategy](06-Database-Strategy.md) | Tables, relationships, indexes, conventions. |
| 07 | [Realtime Architecture](07-Realtime-Architecture.md) | Sync loop, conflicts, dedupe, scaling. |
| 08 | [API Strategy](08-API-Strategy.md) | Server Actions vs Routes, validation, flows. |
| 09 | [Error Handling](09-Error-Handling.md) | Error taxonomy, logging, recovery. |
| 10 | [Security Architecture](10-Security-Architecture.md) | Authz, RLS, secrets, CSP, hardening. |
| 11 | [Performance Strategy](11-Performance-Strategy.md) | Loading, splitting, pagination, caching. |
| 12 | [Coding Standards](12-Coding-Standards.md) | Conventions for TS/React/files/tests. |
| 13 | [Git Strategy](13-Git-Strategy.md) | Branching, commits, PRs, releases. |
| 14 | [Environment Variables](14-Environment-Variables.md) | Every env var + `.env.example` spec. |
| 15 | [Scalability Plan](15-Scalability-Plan.md) | 100 → 100,000 users without redesign. |
| 16 | [Risks](16-Risks.md) | Architecture/perf/security/scaling risks. |

---

## Confirmed Technology Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Framework | Next.js 15 (App Router) | SSR/RSC, routing, server actions, edge/runtime. |
| UI runtime | React 19 | Component model, Server Components, transitions. |
| Language | TypeScript | End-to-end type safety. |
| Styling | Tailwind CSS | Utility-first styling. |
| Components | shadcn/ui | Owned, accessible component primitives. |
| Backend/DB | Supabase (PostgreSQL) | Data, auth, realtime, storage — one managed backend. |
| Auth | Supabase Auth | GitHub + Google OAuth, sessions. |
| Realtime | Supabase Realtime | Postgres change streams over WebSockets. |
| Storage | Supabase Storage | Future file/attachment support. |
| Client state | Zustand | Lightweight global UI/session state. |
| Validation | Zod | Runtime schema validation (shared client/server). |
| Forms | React Hook Form | Performant form state + Zod resolver. |
| Toasts | Sonner | Non-blocking notifications. |
| Icons | Lucide | Icon set. |
| Editor | Monaco Editor | Rich snippet editing (lazy-loaded). |
| Highlight | Shiki | Server-side syntax highlighting for read views. |
| Hosting/CI | Vercel | Build + deploy from GitHub. |
| Repo | GitHub | Source control + CI trigger. |

Every choice is validated against three constraints from the PRD: **free-tier operability, scale-without-rewrite, and trust-by-default.**

---

## Architecture Principles (the decision lens)

1. **Server-first, client-where-it-must-be.** Prefer React Server Components and Server Actions; push to the client only for interactivity (realtime, editor, forms).
2. **Postgres is the single source of truth.** Clients hold a synchronized cache, never authority.
3. **Security lives at the data layer.** Row-Level Security is the enforcement boundary; the app never becomes the only thing standing between users and each other's data.
4. **Persist-then-broadcast.** A change is durable before it is ever synced. No "synced but unsaved" states.
5. **Reconcile against truth on reconnect.** No silent data loss; idempotent change application.
6. **Feature-based modularity.** Code is organized by product capability, not by technical type, so features stay cohesive and independently evolvable.
7. **Boringly reliable core.** The sync loop's correctness outranks every other concern.
8. **Build-clean-first.** Vercel is the first compile; correctness is reasoned statically before merge.

---

## Environment Constraint (operational reality)

Development happens on a restricted machine with **no local build/run** (no npm/node/next/tsc/docker/git/CLIs). The pipeline is **generate files → push to GitHub → Vercel builds**. Vercel is therefore the *first* environment where code is ever compiled. Consequences that shape this architecture:

- Favor **conventional, well-trodden patterns** (App Router defaults, standard Supabase clients) that build predictably on Vercel with minimal configuration surface.
- Keep the **server/client boundary explicit** to avoid the most common Next.js build failures (client-only APIs in server code, and vice versa).
- Keep **dependencies conservative and version-aligned** with Next.js 15 / React 19.
- Expect and budget for **fix-from-Vercel-logs** cycles, especially early.

---

*Read 01 first; it frames everything else.*
