# 01 — High-Level Architecture

**Version:** 1.0 · **Last updated:** 2026-07-22

This document describes the overall system, its major components, and every significant interaction. It is the map the other 15 documents zoom into.

---

## 1. System Overview

DevSync is a **web-first SaaS** built on a **thin, server-rendered Next.js frontend** talking to a **single managed backend (Supabase)** that provides database, auth, realtime, and storage. There is deliberately **no separate custom backend service** — this is the key architectural decision that keeps the product free-tier-operable and low-maintenance while remaining scalable.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT (browser)                             │
│  Next.js 15 App Router · React 19 · Tailwind · shadcn/ui              │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────────────┐  │
│  │ Server Comps  │  │ Client Comps  │  │ Realtime subscription     │  │
│  │ (data fetch,  │  │ (editor,      │  │ (WebSocket to Supabase)   │  │
│  │  RSC render)  │  │  forms, state)│  │                          │  │
│  └───────────────┘  └───────────────┘  └──────────────────────────┘  │
└───────┬───────────────────────┬───────────────────────┬──────────────┘
        │ HTTPS (RSC/actions)   │ HTTPS (REST via SDK)   │ WSS (realtime)
        ▼                       ▼                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       VERCEL (hosts Next.js)                          │
│  • Serves RSC / static / edge                                         │
│  • Runs Server Actions & Route Handlers (privileged server logic)     │
│  • Injects environment variables                                      │
└───────────────────────────────┬──────────────────────────────────────┘
                                 │ Supabase JS client (server + browser)
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                             SUPABASE                                  │
│  ┌──────────┐  ┌───────────────────┐  ┌───────────┐  ┌─────────────┐ │
│  │  Auth    │  │ PostgreSQL         │  │ Realtime  │  │  Storage    │ │
│  │ (OAuth)  │  │ + Row-Level Sec.   │  │ (change   │  │ (files,     │ │
│  │          │  │ + full-text search │  │  streams) │  │  future)    │ │
│  └────┬─────┘  └─────────┬─────────┘  └─────┬─────┘  └─────────────┘ │
└───────┼──────────────────┼──────────────────┼────────────────────────┘
        │                  │                  │
        ▼                  │                  ▼
 GitHub / Google       (source of truth)   Broadcasts DB changes
 OAuth providers                            to subscribed clients
```

**Why one managed backend (no custom API server):**
- **Free-tier fit:** One Supabase project covers DB + auth + realtime + storage; no servers to run or pay for.
- **Less to operate:** No custom service to deploy, scale, patch, or monitor — critical for a small team and the no-local-build constraint.
- **Security at the data layer:** RLS lets the client talk to the database *directly and safely*, removing the need for a hand-written CRUD API for most operations.
- **Scales by tier, not by rewrite:** Growth means moving up Supabase/Vercel plans, not re-platforming.

The trade-off (vendor coupling) is accepted deliberately and mitigated (see [16-Risks](16-Risks.md) O2): Postgres is portable, and data-access is kept behind a thin internal service layer so a future migration is contained.

---

## 2. Client Architecture

The client is a Next.js 15 App Router application using React 19 Server Components by default.

**Two rendering modes, used intentionally:**

| Mode | Used for | Why |
|------|----------|-----|
| **Server Components (default)** | Initial data fetch, list rendering, read views, syntax-highlighted snippet display (Shiki) | Less JS shipped, faster first paint, secrets stay server-side, data fetched close to the source. |
| **Client Components (opt-in)** | Realtime subscription, Monaco editor, forms (RHF), Zustand-backed UI state, clipboard actions, toasts | These require browser APIs, interactivity, or live subscriptions. |

**Client responsibilities:**
- Render UI and manage interaction.
- Hold a **synchronized cache** of the user's snippets/projects for the active view (never authoritative).
- Maintain the **realtime subscription** and reconcile on reconnect.
- Perform **optimistic UI** for create/edit/delete, confirmed by the server/DB.

**Explicit non-responsibility:** the client is never the security boundary. Even a fully compromised client cannot read another user's data because RLS enforces isolation server-side.

---

## 3. Server Layer (within Next.js on Vercel)

There is no standalone backend, but Next.js runs privileged **server-side logic** on Vercel:

- **Server Components** fetch data using a **server-side Supabase client** bound to the user's session (respecting RLS).
- **Server Actions** perform mutations that benefit from running on the server (validation with Zod, revalidation, operations needing elevated care).
- **Route Handlers** cover cases that need an HTTP endpoint: the OAuth callback, the public share-link route, webhooks (future), and health checks.

**Rule of thumb (detailed in [08-API-Strategy](08-API-Strategy.md)):** *Server Actions for app-internal mutations; Route Handlers for external/edge-triggered HTTP.*

---

## 4. Database

- **PostgreSQL on Supabase** is the single source of truth for all state: accounts, devices, projects, snippets, and (later) collections, share links, teams.
- **Row-Level Security** is the primary authorization mechanism — every table access is filtered to the authenticated user (details in [06](06-Database-Strategy.md) and [10](10-Security-Architecture.md)).
- **Full-text search** is served by Postgres itself (no separate search service), keeping the stack minimal and free.
- Access is always through the Supabase client (server or browser), never via ad-hoc raw connections, so RLS and connection pooling are consistently applied.

---

## 5. Authentication

- **Supabase Auth** with **GitHub** and **Google** OAuth (per PRD).
- The browser and server share the session via secure cookies; the **Next.js middleware** refreshes sessions and gates protected routes.
- DevSync never handles passwords or provider tokens directly.
- Full flow in [05-Authentication-Architecture](05-Authentication-Architecture.md).

```
User ─▶ "Sign in with GitHub/Google" ─▶ Supabase Auth ─▶ Provider consent
     ◀─ session cookie set ◀─ callback route handler ◀─ provider returns identity
```

---

## 6. Realtime

- **Supabase Realtime** streams **Postgres change events** (insert/update/delete) over WebSockets to subscribed clients.
- Subscriptions are **scoped per user** and aligned with RLS so a client only ever receives its own rows' changes.
- The sync contract is **persist-then-broadcast** and **reconcile-on-reconnect** (full treatment in [07-Realtime-Architecture](07-Realtime-Architecture.md)).

```
Device A writes ─▶ Postgres persists ─▶ Realtime emits change ─▶ Devices B,C update live
```

---

## 7. Storage

- **Supabase Storage** is provisioned but **not used at MVP** (text-only per PRD).
- It is reserved for the future file/attachment/image roadmap. Access will be governed by storage policies analogous to RLS.
- Documented now so the architecture reserves the capability without building it prematurely.

---

## 8. Deployment

```
Developer (restricted machine)
   │  generates/edits files (no local build)
   ▼
GitHub repository  ──(push / PR merge)──▶  Vercel
   │                                         │  installs deps, builds Next.js
   │                                         │  runs Server Components/Actions at runtime
   │                                         ▼
   │                                    Production deployment (global edge/CDN)
   │                                         │
   └──────────────  build logs  ◀────────────┘   (fed back on failure for static fixes)

Supabase project (DB + Auth + Realtime + Storage) — configured via dashboard/migrations,
consumed by the Vercel-hosted app through environment variables.
```

- **CI/CD:** GitHub → Vercel. Every push builds; PRs get **preview deployments**; merging to the production branch deploys live.
- **Config:** environment variables are injected by Vercel (see [14](14-Environment-Variables.md)); no secrets in the repo.
- **First-build reality:** Vercel is the first compiler; the folder structure, server/client boundaries, and conservative dependencies (documents 02, 03, 12) are all designed to build cleanly on first attempt.

---

## 9. End-to-End Interaction: the Core Loop

Putting it together — a developer copies an error on Device A and pastes it into an AI assistant on Device B:

```
1. Device A (client component) submits a new snippet
        │  Server Action (Zod-validated)  OR  direct RLS-guarded insert
        ▼
2. Supabase: RLS verifies ownership → PostgreSQL persists the row (durable)
        │
        ├─▶ 3. Server Action returns ack → Device A shows it (optimistic → confirmed)
        │
        └─▶ 4. Realtime emits an INSERT event on the user's channel
                    │
                    ▼
5. Device B (subscribed) receives the event → updates its Zustand-backed cache
        │  → snippet appears at top of the stream with a highlight (Sonner optional)
        ▼
6. User on Device B clicks "Copy" → clipboard → pastes into the AI assistant
```

Every numbered step maps to a dedicated document: mutation/validation → [08], persistence/RLS → [06]/[10], realtime → [07], client state → [04], error paths → [09].

---

## 10. Cross-Cutting Concerns (where each lives)

| Concern | Owning document |
|---------|-----------------|
| Who can see what | [10 Security](10-Security-Architecture.md) (RLS), [05 Auth](05-Authentication-Architecture.md) |
| Data shape & integrity | [06 Database](06-Database-Strategy.md) |
| Never losing a snippet | [07 Realtime](07-Realtime-Architecture.md), [09 Errors](09-Error-Handling.md) |
| Speed & cost | [11 Performance](11-Performance-Strategy.md), [15 Scalability](15-Scalability-Plan.md) |
| Consistency of code | [12 Standards](12-Coding-Standards.md), [02 Folders](02-Folder-Structure.md), [03 Components](03-Component-Architecture.md) |
| Config & secrets | [14 Env Vars](14-Environment-Variables.md) |

---

## 11. Why This Architecture Satisfies the PRD Constraints

- **Free-tier:** single managed backend + Vercel; Postgres-native search and realtime avoid extra paid services.
- **Scale without rewrite:** same components from 100 → 100,000 users; scaling is tier changes and read/query optimization, not re-platforming ([15](15-Scalability-Plan.md)).
- **Trust by default:** RLS + no password handling + persist-then-broadcast + explicit deletion.
- **Reliable core loop:** the sync contract is built into the data/realtime layers, not bolted on.
- **Buildable under the environment constraint:** conventional patterns, explicit boundaries, conservative deps.

---

*End of High-Level Architecture.*
