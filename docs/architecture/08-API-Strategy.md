# 08 — API Strategy

**Version:** 1.0 · **Last updated:** 2026-07-22

This document defines how DevSync exposes and organizes server-side operations: when to use **Server Actions** vs. **Route Handlers**, validation, error responses, versioning, naming, and the request/response flow. It is a strategy specification — **no endpoint implementations or code** are written here.

Because DevSync has **no separate backend** (Supabase is the backend), "API" here means the **Next.js server layer** (Server Actions + Route Handlers) plus the **`services/` data-access layer** that both call.

---

## 1. Two Server Mechanisms — and When to Use Each

| Mechanism | Use for | Why |
|-----------|---------|-----|
| **Server Actions** | App-internal mutations invoked from our own UI: create/edit/delete snippet, create/rename/delete project, rename/revoke device, update preferences, create/revoke share link. | Type-safe, no manual endpoint plumbing, integrate with React 19 forms + `useTransition`, run on the server with the user's session (RLS-respected), and support cache revalidation. Ideal for the "our React app talks to our server" case. |
| **Route Handlers** | HTTP endpoints for **external or non-UI** callers: OAuth callback, public share-link route, health check, webhooks (future), and the future public API (v3). | These need a real URL/HTTP contract (external redirects, third-party calls, unauthenticated public access). Server Actions are not addressable URLs and are the wrong tool for external entry points. |

**The rule:** *Server Actions for internal mutations; Route Handlers for external/HTTP entry points.* Reads for initial render happen directly in **Server Components** via `services/` (no action/route needed).

**Why not build a conventional REST/GraphQL API for everything:** it would duplicate what RLS + Supabase already provide and add a maintenance burden with no benefit at MVP. We add HTTP endpoints only where an external contract is genuinely required. A public REST API is a deliberate v3 deliverable (ecosystem), not an MVP need.

---

## 2. Layering: UI → Server Action/Route → Service → Supabase

```
Client Component (form / button)
        │  invoke Server Action  (or) Route Handler receives HTTP request
        ▼
Server Action / Route Handler
        │  1. authenticate (server session)          [05]
        │  2. validate input (Zod)                   [§3]
        │  3. call services/ function
        ▼
services/ (data-access layer)                        [02]
        │  typed Supabase call (RLS-scoped as user)
        ▼
Supabase (PostgreSQL + RLS)                           [06][10]
        │  persist / read
        ▼
        └─ Realtime emits change (for mutations)      [07]
```

**Responsibilities are strictly separated:**
- **Server Action/Route:** orchestration — authn check, validation, calling services, shaping the response, triggering revalidation. **No direct DB calls.**
- **`services/`:** the only layer that touches the Supabase client. Returns typed results/errors.
- **Supabase/RLS:** persistence + authorization backstop.

This separation means the security-critical path (authn → validate → RLS) is uniform and auditable across every operation.

---

## 3. Validation Strategy (Zod everywhere at the boundary)

- **Single source of truth for shapes:** **Zod schemas** define the shape/constraints of every input (snippet content/title/type, project name, etc.), stored in the feature's `schemas/` ([02](02-Folder-Structure.md)).
- **Shared client + server:** the **same schema** validates in the browser (React Hook Form + Zod resolver, for instant UX) and is **re-validated on the server** inside every Server Action/Route Handler. **The client validation is a convenience; the server validation is the guarantee.** Never trust client-validated input.
- **Defense in depth:** Zod (app layer) + DB constraints/checks ([06](06-Database-Strategy.md)) + RLS (authz). Three independent layers.
- **Type inference:** TypeScript types are **inferred from Zod schemas**, so the validated shape and the static type never drift.
- **Content limits:** size/format limits (e.g., max content length) are encoded in Zod and mirrored by DB check constraints.

---

## 4. Error Response Model

All server operations return a **consistent, typed result** rather than throwing raw errors across the boundary. (Full taxonomy and handling in [09](09-Error-Handling.md); the contract lives here.)

**Result contract (conceptual):**
```
Success:  { ok: true,  data: <typed payload> }
Failure:  { ok: false, error: { code, message, fieldErrors? } }
```

- **`code`** is a **stable, machine-readable enum** (e.g., `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_FAILED`, `NOT_FOUND`, `RATE_LIMITED`, `CONFLICT`, `INTERNAL`). Clients branch on `code`, never on message text.
- **`message`** is a **safe, user-appropriate** string — never leaks internals, stack traces, or DB errors.
- **`fieldErrors`** (optional) maps input fields to messages for form display (drives RHF error rendering).
- **Route Handlers** additionally set the correct **HTTP status** (401/403/400/404/429/409/500) matching the `code`.
- **Server Actions** return the result object; the UI reads `ok` and renders success (Sonner toast) or error accordingly.

**Why a typed result over throwing:** it makes error handling explicit and type-checked at call sites, avoids leaking sensitive details, and is easy to reason about statically (no hidden throw paths) — valuable given the no-local-runtime constraint.

---

## 5. Naming Conventions

**Server Actions** (verb-first, intent-revealing):
- `createSnippet`, `updateSnippet`, `deleteSnippet`, `moveSnippetToProject`
- `createProject`, `renameProject`, `deleteProject`
- `renameDevice`, `revokeDevice`
- `updatePreferences`
- `createShareLink`, `revokeShareLink` `[v1.1]`

**Route Handlers** (RESTful, resource-oriented paths under `app/`):
- `GET  /auth/callback` — OAuth code exchange.
- `GET  /share/:token` — public read-only share view resolution.
- `GET  /api/health` — health/status check.
- `POST /api/webhooks/*` — inbound webhooks (future).
- `/(api)/v1/...` — versioned public API (v3; see §6).

**Conventions:**
- Actions: `camelCase` verbs; one clear responsibility each.
- Routes: lowercase, hyphenated, resource-noun paths; standard HTTP verbs with correct semantics (GET safe/idempotent, no state change on GET).
- Consistency with the feature that owns them ([02](02-Folder-Structure.md)): actions live in `features/<x>/actions/`.

---

## 6. Versioning Strategy

- **MVP (Server Actions):** internal actions are **not URL-versioned**; they evolve with the app and are type-checked against their callers at build time. Backwards compatibility is a compile-time concern, not a wire-protocol one.
- **Public HTTP API (v3):** the future public API is **URL-versioned** (`/api/v1/...`). Rules:
  1. **Additive changes** (new fields/endpoints) don't bump the version.
  2. **Breaking changes** introduce a new version (`/api/v2`) with an overlap/deprecation window.
  3. Responses use the stable `code` enum contract (§4) so integrators code against stable identifiers.
- **Why defer versioning:** versioning matters only for **external** consumers who can't be updated in lockstep. Internal actions have a single, co-deployed consumer (our app), so versioning them early is pure overhead. This aligns with the roadmap (public API = v3).

---

## 7. Request Flow (detailed example — create snippet)

```
1. User submits CreateSnippetDialog (Client Component: RHF + Zod resolver)
      └─ client-side Zod validation passes → optimistic insert into synced store [04]
2. Server Action `createSnippet(input)` invoked
      3. authn: server session verified (else → { ok:false, code:UNAUTHENTICATED }) [05]
      4. authz context: user id from session (RLS will enforce ownership)          [10]
      5. server-side Zod re-validation (else → VALIDATION_FAILED + fieldErrors)     [§3]
      6. services.createSnippet(userId, data) → RLS-guarded INSERT                  [06]
      7. on success: revalidate affected server-cached views
8. Result returned:
      ok=true  → confirm optimistic entry; toast "Synced"                          [04]
      ok=false → roll back optimistic entry; show field/error message              [09]
9. Independently, Supabase Realtime emits INSERT → other devices update            [07]
```

---

## 8. Response Flow

```
services/ returns typed { data } | { error }
      ▼
Server Action/Route maps it to the Result contract (§4)
      │  (Route Handler also sets HTTP status)
      ▼
Client:
   Server Action → caller reads ok/data/error → updates store + Sonner toast + form errors
   Route Handler → fetch/redirect consumer reads status + JSON body
```

- **No raw errors cross the boundary.** Internal errors are logged server-side with detail ([09](09-Error-Handling.md)) and returned to the client as a safe `INTERNAL` code + generic message.
- **Success payloads are typed** (inferred from Zod/DB types) so client and server agree at compile time.

---

## 9. Idempotency & Safety

- **Reads** (Server Components/`GET` routes) are side-effect-free and safe to retry/cache.
- **Mutations** carry the entity's **stable UUID** ([06](06-Database-Strategy.md) §4), enabling **idempotent creates** (a retried create with the same id doesn't duplicate — critical for offline flush + realtime echo, [07](07-Realtime-Architecture.md) §5).
- **No state-changing GETs** (CSRF-safe; [10](10-Security-Architecture.md)).
- **Rate limiting** applies at the Route Handler / action boundary for abuse-prone operations (share-link creation, auth) — see [10](10-Security-Architecture.md) §7.

---

## 10. Summary of Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Primary mutation mechanism | Server Actions | Type-safe, no plumbing, session-aware, form-native. |
| External/HTTP entry points | Route Handlers | Need addressable URLs (OAuth, share, webhooks, public API). |
| Reads for render | Server Components via `services/` | Fast, minimal JS, RLS-scoped, no extra API. |
| Validation | Zod (client convenience + server guarantee) + DB constraints | Defense in depth; types inferred from schemas. |
| Error model | Typed `{ ok, data | error{code,message,fieldErrors} }` | Explicit, safe, statically checkable. |
| Versioning | None internally; URL-versioned public API at v3 | Versioning is for external consumers only. |
| DB access | Only through `services/` | One auditable, RLS-consistent, migration-friendly layer. |

---

*End of API Strategy.*
