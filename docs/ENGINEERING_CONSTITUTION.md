# DevSync — Engineering Constitution

> **Copy Once. Debug Anywhere.**
> **Status:** Ratified v1.0 · **Last updated:** 2026-07-23 · **Owner:** Principal Engineering

---

## Preamble

This document is the **single source of truth for how DevSync is engineered**. It governs every future implementation by any contributor — human or AI. It defines not just *what* we build (that is the [PRD](00-README.md)) or the *shape* of the system (that is the [Architecture](architecture/00-README.md)), but the **non-negotiable rules and defaults** every change must obey.

### Precedence

1. **This Constitution wins.** When any future prompt, instruction, ticket, or convenience conflicts with this document, **this document takes precedence.** A contributor who believes a rule is wrong must change the rule here first (see *Amendments*), not violate it.
2. **Companion documents.** The [PRD](01-PRD.md) and [Architecture set](architecture/00-README.md) are authoritative for product scope and system design respectively. This Constitution governs engineering *execution* and defers to them on scope/design; where it restates a decision, the two must agree.
3. **Hierarchy of authority:** Constitution (how we build) → Architecture (system design) → PRD (product scope) → individual tickets/prompts (specific work). Lower levels may not override higher ones.

### Amendments

- The Constitution is amended only via a Pull Request that edits this file, with a rationale, reviewed and approved like any other change (see §17).
- Significant decisions are additionally recorded as **ADRs** (Architecture Decision Records) under `docs/adr/`.
- Bump the version at the top and note the change in the *Changelog* when a rule materially changes.

### Development environment reality (binds every rule below)

DevSync is developed without a local build/run step. The pipeline is **generate files → push to GitHub → Vercel builds**. **Vercel is the first environment where code is ever compiled.** Therefore:

- Correctness is established by **static reasoning and review**, not by running the app locally.
- **TypeScript is the build gate** (`typescript.ignoreBuildErrors` stays `false`). A type error fails the deploy.
- **ESLint is intentionally decoupled from the Vercel build** (`eslint.ignoreDuringBuilds: true`) and runs as a CI/local quality gate. Lint fragility must never block a release; type-safety must never be bypassed to force one.
- Every change must be written to **build cleanly on the first attempt**.

---

## Table of Contents

1. [Engineering Principles](#1-engineering-principles)
2. [Repository Standards](#2-repository-standards)
3. [TypeScript Standards](#3-typescript-standards)
4. [React Standards](#4-react-standards)
5. [Next.js Standards](#5-nextjs-standards)
6. [Styling Standards](#6-styling-standards)
7. [Component Standards](#7-component-standards)
8. [State Management](#8-state-management)
9. [Forms & Validation](#9-forms--validation)
10. [API Standards](#10-api-standards)
11. [Database Standards](#11-database-standards)
12. [Authentication & Security](#12-authentication--security)
13. [Logging & Error Handling](#13-logging--error-handling)
14. [Performance Standards](#14-performance-standards)
15. [Accessibility Standards](#15-accessibility-standards)
16. [Testing Philosophy](#16-testing-philosophy)
17. [Git Standards](#17-git-standards)
18. [Documentation Standards](#18-documentation-standards)
19. [AI Collaboration Rules](#19-ai-collaboration-rules)
20. [Definition of Done](#20-definition-of-done)
- [Changelog](#changelog)

---

## 1. Engineering Principles

These principles are the tie-breakers. When a decision is ambiguous and no specific rule applies, choose the option that best honors these — in roughly this priority order.

| Principle | What it means | Why |
|-----------|---------------|-----|
| **Simplicity over cleverness** | Prefer the obvious solution a mid-level engineer can read at a glance. Avoid metaprogramming, deep abstractions, and "smart" one-liners. | Cleverness is a tax paid on every future read and every AI edit. We optimize for the reader, not the author. |
| **Readability first** | Code is written once and read hundreds of times. Names reveal intent; control flow is linear; no surprises. | The team (and AI contributors) must reason about code *statically* — we cannot lean on a debugger locally. |
| **Composition over inheritance** | Build behavior by composing small functions/components, not class hierarchies. No component inheritance. | Composition is flexible, testable, and matches React's model. |
| **Convention over configuration** | Follow the established pattern (this document) rather than inventing per-file conventions. | Consistency makes the codebase predictable and safe to change at scale. |
| **Small, reusable units** | Small functions, small components, single responsibility. Promote to shared only on real reuse. | Small units are easier to read, test, reuse, and review. |
| **Security by default** | Every path assumes hostile input and enforces isolation at the data layer (RLS). Trust nothing from the client. | Users paste secrets; a single leak is existential (see [Security Architecture](architecture/10-Security-Architecture.md)). |
| **Accessibility by default** | Semantic HTML, keyboard support, and AA contrast are part of "working," not an add-on. | Accessible software is better software; it is a requirement, not a feature. |
| **Performance by default** | Server-first rendering, bounded payloads, and lazy-loading of heavy code are the default posture. | Performance protects UX *and* the free-tier cost budget. |
| **Mobile-first responsive design** | Design and implement the small-viewport layout first, then enhance upward. | The majority of first touches are mobile; it forces content priority. |
| **Production-ready code only** | No placeholders, no `TODO`-as-implementation, no dead scaffolding merged to `main`. | Vercel builds and ships `main`; there is no "just for now." |

**Rule of thumb:** *If you cannot explain a piece of code to a teammate in one sentence, it is too clever.*

---

## 2. Repository Standards

The repository is **feature-first**: code is grouped by product capability, with clearly bounded global layers for shared concerns. This section is binding; the full rationale is in [02-Folder-Structure](architecture/02-Folder-Structure.md).

### 2.1 Allowed top-level hierarchy

```
devsync/
├── app/            # Next.js App Router: routes, layouts, error/loading/not-found, route handlers
├── components/     # Cross-feature UI — ui/ (primitives), shared/, layout/, sections/
├── features/       # Feature modules (the heart of the app)
├── hooks/          # Cross-feature React hooks
├── lib/            # Library setup, env loader, constants, theme, feature flags
├── providers/      # App-level context providers
├── services/       # Data-access layer — the ONLY layer that talks to Supabase
├── stores/         # Zustand global stores
├── styles/         # Global CSS + design tokens
├── supabase/       # Database as code (migrations, policies) — reserved
├── types/          # Shared, API, and database types
├── utils/          # Pure helpers (no side effects, no React, no Supabase)
├── public/         # Static assets
└── docs/           # Product + architecture documentation
```

New top-level folders require an amendment to this document.

### 2.2 Folder ownership

| Folder | Owns | May NOT contain |
|--------|------|-----------------|
| `app/` | Routing & composition only | Business logic, data-access calls, large components |
| `components/ui/` | Presentational primitives (shadcn/ui) | Data fetching, business logic, global-store reads |
| `components/shared/` | Cross-feature composites | Feature-specific logic, data fetching |
| `components/layout/` | App chrome (header/footer/shell) | Feature logic |
| `components/sections/` | Page-specific marketing/section blocks | Reusable primitives (promote to `shared/`) |
| `features/<x>/` | Everything used only by feature `x` | Imports of another feature's internals |
| `services/` | All Supabase data access | UI, React, cross-feature orchestration |
| `lib/` | Library setup & low-level clients/config | React components, business rules |
| `utils/` | Pure, dependency-light helpers | Side effects, React, Supabase, network |
| `types/` | Cross-cutting types | Feature-owned types (keep those in the feature) |

### 2.3 Feature isolation & import boundaries

- A feature module (`features/<x>/`) exposes a **single public surface** (`index.ts`). Other code imports **only** from that surface — never a deep path into another feature.
- **Dependency direction is one-way** (no cycles):

  ```
  app/ → features/ → services/ → lib/
   │        │           │
   └→ components/    types/, utils/   (leaf layers: depend on nothing app-specific)
  ```

- `utils/` and `types/` are **leaves**: they import nothing app-specific.
- `services/` may use `lib/`, `types/`, `utils/` — never `features/` or `components/`.
- Circular imports are forbidden (enforced by lint). If two modules need shared code, promote it to a leaf layer.

### 2.4 Maximum nesting

- Within a feature, keep directory nesting to **≤ 3 levels** (`features/snippets/components/…`).
- Overall path depth from repo root should rarely exceed **4 levels**. Deeper nesting is a smell — flatten or promote.

### 2.5 File naming

| Kind | Convention | Example |
|------|-----------|---------|
| Component file & component | `PascalCase` | `SnippetCard.tsx` |
| Hook file & hook | `use` + `camelCase` | `use-mounted.ts` → `useMounted` |
| Directory | `kebab-case` | `features/snippets` |
| Non-component module | `kebab-case` | `site-config.ts`, `feature-flags.ts` |
| Route files (App Router) | framework names | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| Test file | co-located `*.test.ts(x)` | `formatters.test.ts` |

- One primary export per file (a component, a hook, or a schema), with tightly-coupled helpers co-located.
- **`cn` lives at `utils/cn.ts`** and is the single class-merge helper (`components.json` `utils` alias points here). Do not create a second `cn`.

### 2.6 Allowed file types

`.ts`, `.tsx`, `.css` (only `styles/globals.css` holds global CSS), `.md` (docs), `.svg`/static assets in `public/`, and config files at the root. No `.js`/`.jsx` application code (config files like `eslint.config.js`/`postcss.config.js` are the only `.js`). No CSS Modules, no `.scss`.

---

## 3. TypeScript Standards

TypeScript is the **build gate**; type-safety is non-negotiable. The compiler configuration (`tsconfig.json`) is already strict — code must comply.

### 3.1 Compiler posture (already enforced)

`strict`, `noImplicitAny`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `forceConsistentCasingInFileNames`, `moduleResolution: "bundler"`, `@/*` absolute imports.

### 3.2 Rules

| Rule | Detail |
|------|--------|
| **No `any`** | Banned in application code. Use `unknown` + narrowing. An `any` requires an inline justification and reviewer sign-off (rare). |
| **Prefer `unknown`** | For genuinely unknown values (e.g. caught errors, external JSON), narrow with type guards before use. |
| **`readonly` where possible** | Mark data that must not mutate `readonly`; prefer `ReadonlyArray<T>` for immutable lists. Never mutate shared objects. |
| **Explicit return types on exported functions** | Every exported function/service declares its return type. Aids readers and the compiler; supports static reasoning. |
| **Discriminated unions** | Model results and states as discriminated unions (e.g. the `ActionResult` `{ ok: true } \| { ok: false }`). Handle with exhaustive `switch` + a `never` guard in `default`. |
| **Branded types where appropriate** | For identifiers that must not be interchanged (e.g. `SnippetId`, `ProjectId`, `AccountId`), use a branded type (`type SnippetId = string & { readonly __brand: "SnippetId" }`) to prevent mixing ids. |
| **Utility types** | Prefer built-ins (`Pick`, `Omit`, `Partial`, `Awaited`, `ReturnType`) and shared helpers in `types/` (`Nullable`, `Maybe`, `Prettify`) over ad-hoc shapes. |
| **Type reuse — never duplicate** | Types are inferred from **Zod schemas** (`z.infer`) and **generated** from the database (`types/database.ts`). Never hand-maintain a type that duplicates a schema or a DB row. |
| **`exactOptionalPropertyTypes` discipline** | Do not assign explicit `undefined` to a bare-optional property. Omit the property instead. Optional props are `?`, not `T \| undefined`, unless `undefined` is a meaningful value. |
| **`import type`** | Use `import type` for type-only imports (helps bundling and clarity). |

### 3.3 Example — the result contract (illustrative)

```ts
// types/api.ts (already established) — every server operation returns this.
type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string; fieldErrors?: Record<string, string[]> } };
```

Callers must handle `ok: false`; the compiler enforces it.

---

## 4. React Standards

React 19 with the App Router. Server Components are the default.

| Rule | Detail |
|------|--------|
| **Function declarations only** | Use named function declarations for components (`export function SnippetCard() {}`); no class components (except a required Error Boundary). |
| **Server Components by default** | A component is a Server Component unless it *needs* the client. |
| **Client Components only when necessary** | Add `"use client"` only for interactivity: state, effects, browser APIs, subscriptions, or context that needs the client. Push the client boundary as *low* as possible (a small leaf, not a whole page). |
| **One responsibility per component** | A component renders one coherent thing. Mixing data-fetching, global state, and heavy presentation in one component is a smell — split it. |
| **Maximum component length** | Soft limit **~150 lines**. Beyond that, extract sub-components or hooks. Long JSX is a signal to decompose. |
| **No business logic in components** | Logic lives in hooks, `services/`, or feature `actions/`. Components render and delegate. |
| **Hooks rules** | Obey the Rules of Hooks (top level, no conditionals). Custom hooks are `useX`, do one thing, and return typed values. `useEffect` is a last resort — prefer server fetching, derived state, and event handlers. |
| **Memoization** | Do **not** pre-emptively `memo`/`useMemo`/`useCallback`. Add memoization only to fix a measured, real re-render/perf problem, and comment why. Correctness first, micro-optimization never by default. |
| **List keys** | Stable entity ids (UUIDs) as keys — never the array index. |
| **Prop naming** | Booleans are affirmative (`isLoading`, `hasError`, `canEdit`). Handlers are `onX` (public) / `handleX` (internal). Prop types are `XxxProps`, co-located. |
| **Accessibility** | See §15 — semantic elements, labels, focus, and `aria` are part of the component's contract. |

---

## 5. Next.js Standards

| Area | Standard |
|------|----------|
| **Router** | **App Router only.** No Pages Router. |
| **Server Actions** | Use for **app-internal mutations** invoked from our UI (create/update/delete). They authenticate, validate (Zod), call `services/`, and return an `ActionResult`. |
| **Route Handlers** | Use for **external/HTTP entry points**: OAuth callback, public share route, webhooks, health, and the future public API. Not for internal mutations. |
| **Reads** | Fetch initial data in **Server Components** via `services/`. No client `useEffect` fetch waterfalls for first render. |
| **Metadata API** | Every route exports `Metadata` (and `Viewport` where needed). Titles use the template set in the root layout. No manual `<head>` tags. |
| **Error boundaries** | Provide `error.tsx` per meaningful segment and a root `global-error.tsx`. Wrap risky client widgets in boundaries. Errors are logged (sanitized) and offer recovery. |
| **Loading UI** | Provide `loading.tsx` with a meaningful skeleton/spinner for segments that fetch. Stream with Suspense where it improves perceived speed. |
| **Route groups** | Use groups (e.g. `(marketing)`, `(app)`) to organize without affecting URLs and to scope layouts/middleware. |
| **Parallel & intercepting routes** | Use only where they clearly simplify a real UX need (e.g. modal routes). Do not add speculative complexity. Document any use in the feature's docs. |
| **Dynamic rendering** | Prefer static/streamed rendering. Opt into dynamic rendering only when a route genuinely depends on request-time data (auth/session, personalized content). Be explicit and intentional. |
| **Caching** | Rely on Next's defaults; revalidate precisely on mutation (target the affected views, not blanket busting). Never cache authenticated, user-specific data across users. Document any non-default caching. |
| **Security headers / CSP** | Baseline headers ship from `next.config.ts`. A full CSP (with nonces + Supabase allow-list) is introduced with the auth sprint via middleware (see §12). |

---

## 6. Styling Standards

| Rule | Detail |
|------|--------|
| **Tailwind only** | All styling via Tailwind utility classes. No CSS Modules, no styled-components, no `.scss`. |
| **No inline styles** | Do not use the `style` prop for static styling. The *only* sanctioned `style` use is a genuinely dynamic value that cannot be a class (e.g. a computed `animationDelay` for staggered entrances). |
| **Design tokens are the source of truth** | Colors, radius, fonts, shadows, and animations are defined once as tokens (`styles/globals.css` CSS variables + `tailwind.config.ts`). Components consume **semantic tokens**, never raw values. |
| **Color usage** | Use semantic tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `bg-secondary`, `bg-primary`, `text-destructive`, etc. The **`brand`** accent is used *sparingly* (emphasis, logo, decoration) — never as body text or large fills that would fail contrast. **Never hard-code hex/hsl** in components. |
| **Dark mode** | Dark-mode-first, `class` strategy via next-themes. Every surface must be legible and AA-contrast in **both** themes. Never assume a single theme. |
| **Spacing scale** | Use Tailwind's spacing scale only. Generous, consistent rhythm; large section padding (`py-24` class range) for marketing surfaces. No arbitrary pixel spacing unless unavoidable (justify it). |
| **Typography scale** | Use the scale (`text-sm` … `text-6xl`), `tracking-tight` for headings, `text-balance` for display headings. Fonts are `font-sans` (Inter) and `font-mono` (JetBrains Mono) via `next/font`. |
| **Animation** | Subtle and purposeful. Use the tokenized animations (`animate-fade-in`, `animate-fade-up`, `animate-scale-in`). All motion must respect `prefers-reduced-motion` (globally handled) — never rely on motion to convey meaning. |
| **Responsive breakpoints** | Mobile-first. Base styles target small screens; layer `sm:`/`md:`/`lg:`/`xl:` upward. The page body must never scroll horizontally; wide content scrolls within its own container. |
| **Class composition** | Compose classes with `cn()` (`utils/cn.ts`). Extract repeated class sets into shared components, not copy-paste. Prettier's Tailwind plugin orders classes — do not fight it. |

---

## 7. Component Standards

| Rule | Detail |
|------|--------|
| **Reusable first** | Before writing a component, check `components/ui` and `components/shared`. Extend/compose existing primitives rather than duplicating. |
| **Composition over configuration** | Prefer composable sub-components (`Card` + `CardHeader` + `CardContent`) and `children` over a single component with dozens of boolean/config props. |
| **Tiered organization** | `ui/` (primitives) → `shared/` (cross-feature composites) → `layout/` (chrome) → `sections/` (page blocks) → `features/<x>/components/` (feature-specific). Promote a component upward only when a *second* real consumer appears (rule of three, pragmatic). |
| **Variants** | Use `class-variance-authority` (`cva`) for style variants (as in `Button`/`Badge`). Variants are typed; defaults are explicit. |
| **Props** | Presentational components take data + callbacks via props; they do not fetch data or read global stores. Props are typed (`XxxProps`), destructured in the signature, with affirmative booleans and `onX` handlers. |
| **Children usage** | Prefer `children` for content slots; use named render slots (`actions`, `icon`) only when composition needs distinct regions. |
| **Ref forwarding** | UI primitives that wrap a DOM element forward the ref (`React.forwardRef`) and spread remaining native props, so they compose with `asChild`/Radix `Slot` and remain flexible. |
| **`asChild`** | Interactive primitives (e.g. `Button`) support `asChild` (via Radix `Slot`) so they can render as a `Link` while keeping styling. |
| **Documentation** | Non-trivial shared components carry a short doc comment: purpose, tier, server/client, and responsibility (see §18). |

---

## 8. State Management

Choose the **least powerful** tool that solves the problem. There are three distinct kinds of state; do not conflate them (full rationale: [04-State-Management](architecture/04-State-Management.md)).

| Use… | When | Notes |
|------|------|-------|
| **Local state** (`useState`/`useReducer`, React Hook Form) | State confined to one component or its close children: form fields, dialog open/close, hover, local toggles. | The default. Do not globalize local state. |
| **URL state** (search params / route) | State that should be shareable, linkable, or survive refresh: active filters, selected tab, search query, pagination cursor. | Prefer the URL over a store for view state that users may bookmark or share. |
| **Server state** (Server Components + `services/` + realtime) | Data that lives in the database (snippets, projects, devices). | **Postgres is the source of truth.** The client holds a synchronized *cache*, never authority. Kept fresh by realtime + optimistic mutations, reconciled on reconnect. |
| **Zustand** (`stores/`) | Cross-feature *client* state with no server home: sync-connection status, active-project context, the synced-entity working cache, transient global UI. | Small, focused stores with selector subscriptions. Zustand v5 curried form: `create<T>()(…)`. **Never** the authoritative copy of server data. |
| **Context** (`providers/`) | App-wide, rarely-changing values: theme, session/auth, realtime connection. | Not for high-frequency updates (causes broad re-renders) — use Zustand for those. |

**Avoid unnecessary global state.** If state is only read by one subtree, it is local. Reach for a store only when genuinely cross-cutting.

---

## 9. Forms & Validation

| Rule | Detail |
|------|--------|
| **React Hook Form** | All non-trivial forms use RHF for field state, dirty/touched tracking, and submission. Keep form state out of global stores. |
| **Zod is the schema** | Every input shape is a Zod schema in the feature's `schemas/` (generic ones in `utils/validation.ts`). Types are inferred with `z.infer` — never duplicated. |
| **Validate twice** | Client-side via `@hookform/resolvers` + Zod for instant UX; **re-validate on the server** inside every Server Action/Route Handler. The client check is convenience; **the server check is the guarantee.** DB constraints are the final backstop. |
| **Validation messages** | Human, specific, and actionable ("Please enter a valid email address."). Defined in the Zod schema so client and server agree. |
| **Error display** | Inline, next to the offending field, via RHF. No toast storms for field errors. Server `fieldErrors` re-populate the form on rejection. |
| **Accessibility** | Inputs have associated `<label>`s; errors are linked via `aria-describedby` and announced (`aria-invalid`, `role="alert"` on the message). Submit is not blocked by `disabled` alone — communicate why. |

---

## 10. API Standards

DevSync has **no separate backend**; "API" means the Next.js server layer (Server Actions + Route Handlers) over the `services/` data-access layer. Full detail: [08-API-Strategy](architecture/08-API-Strategy.md).

### 10.1 Response & error format

- Every server operation returns the typed **`ActionResult<T>`** discriminated union — never a thrown error across the boundary.
- **Error object:** `{ code: ErrorCode; message: string; fieldErrors?: Record<string, string[]> }`. Clients branch on the **stable `code`**, never on message text. Messages are safe and user-appropriate — never leak stack traces, DB text, or PII.
- **Error codes (stable enum):** `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_FAILED`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `NETWORK_ERROR`, `REALTIME_DISCONNECTED`, `INTERNAL`.

### 10.2 HTTP status usage (Route Handlers)

| Code | Meaning |
|------|---------|
| 200 / 201 | Success / created |
| 400 | `VALIDATION_FAILED` |
| 401 | `UNAUTHENTICATED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` (incl. expired/invalid share links — no content leak) |
| 409 | `CONFLICT` |
| 429 | `RATE_LIMITED` |
| 500 | `INTERNAL` (detail logged server-side, generic message to client) |

### 10.3 Naming

- **Server Actions:** verb-first `camelCase` — `createSnippet`, `updateSnippet`, `deleteSnippet`, `moveSnippetToProject`, `revokeDevice`.
- **Route Handlers:** resource-oriented, lowercase, hyphenated paths — `/auth/callback`, `/share/:token`, `/api/health`. Correct HTTP verb semantics; **no state-changing GETs**.

### 10.4 Versioning

- **Internal** Server Actions are **not** URL-versioned — they are co-deployed with the app and checked at compile time.
- The **public HTTP API** (v3 roadmap) is URL-versioned (`/api/v1/…`): additive changes don't bump the version; breaking changes introduce a new version with a deprecation window.

### 10.5 Pagination, filtering, sorting

| Concern | Standard |
|---------|----------|
| **Pagination** | **Cursor-based**, keyed on `(created_at, id)` — stable under inserts, index-friendly. No offset pagination for large/growing lists. Return the next cursor. |
| **Filtering** | Explicit, allow-listed filter params (project, type, date range). Validate every filter with Zod. Never build queries from raw client strings. |
| **Sorting** | Allow-listed sort fields + direction only. Default: reverse-chronological (`created_at desc`). Reject unknown sort keys with `VALIDATION_FAILED`. |
| **Idempotency** | Mutations carry the entity's stable UUID so retries (offline flush, realtime echo) do not duplicate. Reads are side-effect-free. |

---

## 11. Database Standards

PostgreSQL on Supabase. **Do not write SQL in this document.** These are the binding conventions migrations must follow (full detail: [06-Database-Strategy](architecture/06-Database-Strategy.md)).

| Area | Standard |
|------|----------|
| **Naming** | `snake_case` everywhere. Table names **plural** (`snippets`, `projects`, `devices`). Column names singular. Booleans read as predicates (`is_default`, `is_revoked`). |
| **Primary keys** | Every table has a UUID `id` primary key. Prefer a **time-ordered UUID** variant for index locality; otherwise UUIDv4. Client-generatable to enable optimistic creation + idempotency. |
| **Foreign keys** | `<entity>_id` (`project_id`, `account_id`, `source_device_id`). Enforce referential integrity with FK constraints. Deletion behavior favors soft-delete + explicit disposition over hard cascade. |
| **Ownership column** | Every user-data row carries the owning `account_id` — the linchpin for RLS. Isolation is a column-level fact, not an app assumption. |
| **Indexes** | Match real query shapes; **owner-leading composite indexes** (`(account_id, created_at desc)`), a **GIN** index for full-text search, **partial indexes** excluding soft-deleted rows. Add indexes on *evidence* (observed slow queries), not speculation. |
| **Audit columns** | `created_at`, `updated_at`, `deleted_at` on every table; domain-specific timestamps where meaningful (`last_active_at`, `expires_at`). Security-significant *actions* also go to an append-only `audit_events` table (added with sharing/teams). |
| **Timestamps** | All timestamps are UTC (`timestamptz`). `created_at` set on insert; `updated_at` maintained by a **database trigger** (never trusted to app code); presentation converts to local/relative time. |
| **Soft deletes** | User-facing entities use a nullable `deleted_at` (null = live). Deleting sets it; queries filter `deleted_at IS NULL`. A purge process hard-deletes beyond a retention window; **account deletion hard-deletes all user data**. Deletion propagates to all devices. |
| **UUID usage** | UUID PKs everywhere; unguessable tokens for share links; no sequential integer ids exposed. |
| **RLS** | RLS **enabled on every user-data table**, default-deny, owner policies keyed to `auth.uid()` (see §12). |
| **Migration philosophy** | All schema/policy change is a **forward-only, reviewable migration** in `supabase/`. Use **expand-then-contract** for breaking changes so an app rollback never breaks against the DB. Generated types (`types/database.ts`) are regenerated, never hand-edited. |

---

## 12. Authentication & Security

Security is enforced **at the data layer**, so no client or application bug can breach isolation. Full detail: [10-Security-Architecture](architecture/10-Security-Architecture.md).

| Area | Standard |
|------|----------|
| **Auth** | Supabase Auth with **GitHub + Google OAuth**. DevSync never handles passwords or provider tokens. Sessions in **HTTP-only, `Secure`, `SameSite` cookies**; server-verified on every protected request; token refresh delegated to Supabase. |
| **RLS required** | **Mandatory** on every user-data table: default-deny, then owner policies (`account_id = auth.uid()`). Realtime respects RLS. Team access (v3) uses membership-based policies layered on the same model. RLS is the *final* authorization boundary — app checks are defense-in-depth, not the guarantee. |
| **Authorization** | Layered: middleware (route gate) → Server Action/Route (re-verify session + validate) → `services/` (owner-scoped queries) → **RLS (authoritative)**. Least privilege at every layer. Authn ≠ authz. |
| **Secrets management** | Server-only secrets (service-role key, OAuth secrets) live **only** in Vercel encrypted env and never enter client bundles or the repo. The service-role key is used sparingly, server-side only. Secrets are rotatable without code changes. |
| **Environment variables** | `NEXT_PUBLIC_` prefix = browser-exposed/public; **everything else is server-only**. The prefix is a security control — a secret with a public prefix is a **blocking** defect. Public vars are validated in `lib/env.ts`; server-only vars are loaded in a server-only module. |
| **Input validation** | Zod at every boundary (client convenience + **server guarantee**) + DB constraints. All external input validated (form inputs, action args, route params, query params). Parameterized access only — never string-built queries. |
| **XSS prevention** | **Snippet content is untrusted text** and is rendered **as text, never as HTML** (no `dangerouslySetInnerHTML` with user content). Syntax highlighting (Shiki) produces escaped, server-rendered output. A strict **CSP** (nonces + Supabase allow-list) is the backstop, introduced with the auth sprint. |
| **CSRF** | `SameSite` cookies + Server Actions' built-in protections + **no state-changing GETs** + origin checks on sensitive handlers. |
| **Rate limiting** | Applied at the Server Action/Route boundary for abuse-prone operations (auth, share-link creation, creation bursts). Returns `RATE_LIMITED`. Upgradable to a dedicated limiter at scale. Size limits complement it. |
| **Privacy** | Data isolated by default; no sensitive data in URLs/logs/analytics; deletion honored end-to-end; no selling/third-party sharing of content. |

---

## 13. Logging & Error Handling

Governing principle: **fail safe, never silent.** The product never pretends an operation succeeded when it didn't. Full detail: [09-Error-Handling](architecture/09-Error-Handling.md).

### 13.1 Error categories

| Category | Handling |
|----------|----------|
| **Expected errors** (validation, not-found, forbidden, rate-limited) | Returned as a typed `ActionResult` failure with the right `code`. Surfaced to the user with a clear, actionable message (inline for validation; toast/inline for others). |
| **Unexpected errors** (bugs, provider failures) | Caught at the boundary, logged with full detail **server-side**, returned to the client as `INTERNAL` with a **safe generic message**. Never leak internals. |
| **Realtime errors** | Never silent. `SyncStatusIndicator` shows connected/reconnecting/offline; auto-reconnect with backoff + reconcile-against-truth; degrade to periodic reconcile on provider outage. |
| **Component crashes** | Contained by Error Boundaries (`error.tsx` per segment + root `global-error.tsx` + boundaries around risky client widgets) with a recovery action. |

### 13.2 Logging conventions

| Do log | Never log |
|--------|-----------|
| Error `code`, operation name, account/device **id**, timestamps, correlation id, technical detail (server-side) | **Snippet content** (may contain secrets), OAuth tokens, full PII, anything that turns logs into a leak vector |

- Levels: `error` (unexpected/security), `warn` (handled-but-notable), `info` (key lifecycle), `debug` (dev only, stripped in prod).
- Security-significant **actions** go to `audit_events` (append-only), distinct from operational error logs.
- **User-friendly messages** for humans; **rich diagnostics** for developers (server logs, correlation id). Never mix the two audiences.

### 13.3 Coding rules

- Return typed results; **do not throw across boundaries**. Callers must handle `ok: false` (compiler-enforced).
- Optimistic UI always has a rollback path tied to confirmed server state.
- Never swallow errors silently.

---

## 14. Performance Standards

Performance is a default posture and a **cost control** (protects the free tier). Full detail: [11-Performance-Strategy](architecture/11-Performance-Strategy.md).

| Lever | Standard |
|-------|----------|
| **Server Components first** | Render lists/reads on the server; ship the minimum client JS. Client Components are small interactive leaves. |
| **Lazy loading** | Heavy/rare client widgets (e.g. the Monaco editor) are **dynamically imported on first use**, never on initial load. Read-only rendering uses server-side Shiki (no editor JS shipped). |
| **Code splitting** | Automatic per route; feature modules split naturally; heavy features load on interaction. Watch the Vercel build's bundle output — a heavy dep in the shared chunk is a regression. |
| **Image optimization** | Use `next/image` (responsive sizes, modern formats, lazy). Fonts via `next/font` (self-hosted, no layout shift). Icons (Lucide) tree-shaken. |
| **Bundle size** | New dependencies require justification (see §19). Prefer platform/standard APIs. Bundle regressions are review blockers. |
| **Caching** | Server-render caching + CDN for cacheable surfaces; precise revalidation on mutation; never cache user-specific data across users. |
| **Database performance** | Owner-leading composite indexes, GIN full-text, cursor pagination, bounded payloads (preview columns in lists; full content on open), connection pooling for serverless. |
| **Realtime optimization** | Per-user scoped channels (bounded fan-out), event batching/coalescing, idempotent id-keyed apply, selector-based store subscriptions. |
| **Targets** | Authenticated first load < 3s; perceived sync latency < 1s (PRD NFRs). |

---

## 15. Accessibility Standards

Accessibility is part of "working." Target **WCAG 2.1 AA**.

| Requirement | Standard |
|-------------|----------|
| **Semantic HTML** | Use the right element (`button`, `a`, `nav`, `main`, `header`, `footer`, `section`, `ul/ol`, headings in order). A `div` with a click handler is not a button. Exactly one `h1` per page; no skipped heading levels. |
| **Keyboard navigation** | Every interactive element is reachable and operable by keyboard in a logical order. Provide a **skip-to-content** link. Menus/dialogs close on `Escape`. No keyboard traps. |
| **Focus management** | Visible focus on every interactive element via `focus-visible` rings (design-token `ring`). Never remove outlines without an equivalent replacement. Move focus intentionally when opening/closing overlays. |
| **ARIA** | Use ARIA only to fill gaps semantic HTML cannot (`aria-label`, `aria-expanded`, `aria-controls`, `aria-live`, `role` where appropriate). Prefer native semantics over ARIA. Decorative elements are `aria-hidden`. |
| **Color contrast** | AA contrast in **both** themes. The `brand` accent is used only where it meets contrast (large text/decoration). Never convey meaning by color alone. |
| **Screen reader support** | Meaningful accessible names for controls and icons-as-buttons; form errors linked and announced; loading states exposed (`role="status"`). |
| **Motion** | Respect `prefers-reduced-motion` (globally handled); motion is never required to understand content. |

---

## 16. Testing Philosophy

Tests are concentrated where a bug is most damaging — **sync correctness and data isolation** — because we cannot verify behavior by running the app locally.

| Layer | What & why |
|-------|-----------|
| **Unit** | Pure logic in `utils/`, Zod schemas, the **idempotent realtime reducer**, and the **cache-apply** logic. Fast, deterministic, highest ROI. |
| **Integration** | `services/` against **RLS behavior** (owner can read own / cannot read others), and the Server Action pipeline (authn → validate → service). Guards the security-critical path. |
| **Component** | Key interactive components (copy action, forms, sync-status indicator) for behavior and accessibility. |
| **End-to-end (post-MVP)** | The core loop across two simulated devices (create → appears → copy), auth, and reconnection — the flows the MVP acceptance bar depends on. |

| Convention | Standard |
|-----------|----------|
| **Test naming** | `describe` the unit; `it("does X when Y")`. Test **behavior, not implementation**; avoid brittle snapshot overuse. |
| **Location** | Co-located `*.test.ts(x)` beside the code under test. |
| **Determinism** | Tests must be environment-independent and deterministic (they run in CI, not on a local box). |
| **Coverage** | No vanity percentage target at MVP; **coverage of correctness-critical paths (sync + RLS) is required**. Coverage expands with the product. |
| **Future CI** | GitHub Actions runs type-check, lint, format check, and tests on every PR; the **Vercel preview build is a required gate**. |

---

## 17. Git Standards

Full detail: [13-Git-Strategy](architecture/13-Git-Strategy.md).

| Area | Standard |
|------|----------|
| **Branching** | **Trunk-based.** `main` is always deployable. Short-lived branches: `feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`, `test/*`, `perf/*`. No long-lived branches. Risky work merges behind a **feature flag**. |
| **Commit format** | **Conventional Commits**: `<type>(<scope>): <imperative summary>`. Scope matches a feature/area (`snippets`, `auth`, `realtime`, `db`). Body explains *why* when non-obvious; `BREAKING CHANGE:` footer when applicable. |
| **PR checklist** | (1) small & focused; (2) CI green (type-check, lint, format, tests); (3) **successful Vercel preview build** (our substitute for a local build); (4) filled template — what/why/how verified (+ preview URL) + risk/rollback; (5) ≥1 approval (**2** for auth/RLS/realtime/sharing); (6) docs updated when behavior/architecture changes. |
| **Code review** | Reviewers check: server/client boundary correctness, RLS/authorization impact, sync correctness (idempotency/reconciliation), no secrets/sensitive content in code or logs, bundle/perf regressions, and Constitution compliance. |
| **Merge** | **Squash-merge** → one clean Conventional Commit per PR on `main`. Linear history; no direct pushes to `main` (branch protection). |
| **Release tagging & versioning** | **Semantic Versioning** (`MAJOR.MINOR.PATCH`), driven by Conventional Commits. MVP → `1.0.0`; roadmap phases map to minors/majors (see [Roadmap](11-Development-Roadmap.md)). Releases are tagged; continuous deployment ships `main`. |
| **Secrets** | Never commit secrets. Only `.env.example` (placeholders) is committed. |

---

## 18. Documentation Standards

Documentation is a first-class deliverable — the codebase must be understandable *statically*.

**Every feature (a `features/<x>/` module or a significant capability) must document:**

| Item | What to include |
|------|-----------------|
| **Purpose** | What the feature does and the user problem it solves. |
| **Architecture impact** | New tables/columns, RLS policies, realtime channels, services, actions, routes, stores; how it fits the existing system. |
| **Public interfaces** | The feature's public surface (`index.ts` exports), Server Actions, Route Handlers, and their `ActionResult` contracts. |
| **Known limitations** | Edge cases, deferred behavior, and accepted trade-offs (e.g. LWW conflict handling). |
| **Future improvements** | What was intentionally left for later and why. |

Additional rules:

- Significant decisions are recorded as **ADRs** in `docs/adr/` (context → decision → consequences).
- Code comments explain **why**, not what; document surprising choices inline and link the relevant doc.
- Public/shared functions and services carry a short doc comment (contract, params, error behavior).
- No commented-out code and no stale `TODO`s on `main`.
- When behavior or architecture changes, the relevant doc (and this Constitution, if a rule changes) is updated in the same PR.

---

## 19. AI Collaboration Rules

DevSync is built with AI contributors. These rules are binding on any AI-generated change and are enforced in review.

| Rule | Detail & rationale |
|------|--------------------|
| **Read before writing** | Inspect the current repository state before changing it. Do not assume file contents from memory. |
| **Never rewrite unrelated files** | Touch only what the task requires. Do not "drive-by" reformat or refactor files outside scope. |
| **Never rename/move existing files without a stated reason** | Renames break imports and history. If a rename is truly needed, justify it and update every reference in the same change. |
| **Maintain import consistency** | Use the established `@/*` aliases and the one-way dependency direction (§2.3). Import features only via their public surface. Never introduce a second `cn` or a duplicate util. |
| **Respect folder ownership** | Place code in the correct layer (§2.2). Data access only in `services/`; pure helpers only in `utils/`; routing only in `app/`. |
| **Prefer extending existing code** | Reuse and compose existing primitives/services/types before adding new ones. Duplication is a defect. |
| **No new dependencies without justification** | A new package requires: a clear need not met by existing deps/platform APIs, React 19 / Next 15 compatibility, bundle-size consideration, and explicit call-out in the PR. Prefer zero-dependency solutions. Unjustified deps are rejected. (Recall: install failures surface only on Vercel — a bad dep can block the whole deploy.) |
| **Keep changes small and reviewable** | Prefer several small, focused PRs over one large one. Small diffs are easier to reason about statically and to localize if the Vercel build fails. |
| **Build-clean-first** | Reason about type-safety and the server/client boundary before proposing code; it must compile on Vercel on the first try. Preserve `exactOptionalPropertyTypes` compliance. |
| **Surface conflicts, don't guess** | If a request conflicts with this Constitution or with existing code, stop and surface it rather than silently producing an inconsistent or destructive change. |
| **Honor the environment** | Never instruct the operator to run commands. Generate files; the operator pushes to GitHub and Vercel builds. |

---

## 20. Definition of Done

A change is **not** complete until **every** box is satisfied. This is the final gate for merge.

| # | Criterion | Meaning |
|---|-----------|---------|
| 1 | **Compiles** | Builds cleanly on Vercel (the first and authoritative build). |
| 2 | **Type-safe** | Passes strict TypeScript (incl. `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`); no `any`. |
| 3 | **Accessible** | Semantic HTML, keyboard-operable, visible focus, AA contrast in both themes, correct ARIA (§15). |
| 4 | **Responsive** | Mobile-first; works from small viewports up; no horizontal body scroll. |
| 5 | **Error handled** | Expected errors returned as typed `ActionResult`; unexpected errors caught, logged (sanitized), and surfaced safely; nothing fails silently. |
| 6 | **Documented** | Feature docs updated (purpose, architecture impact, public interfaces, limitations, future); comments explain *why*. |
| 7 | **No lint issues** | Passes ESLint (flat config) and Prettier — run in CI/locally (lint is decoupled from the build but still required to merge). |
| 8 | **Reusable** | Shared logic/components are composed, not duplicated; placed in the correct layer. |
| 9 | **Consistent with architecture** | Honors server-first rendering, `services/`-only data access, RLS, persist-then-broadcast, and the folder/dependency rules. |
| 10 | **Consistent with this Constitution** | Complies with every applicable rule above. When in doubt, the Constitution wins. |

Additionally: the PR is small and reviewed, the **Vercel preview build is green**, and no secrets or sensitive content were introduced.

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-07-23 | Initial ratified Engineering Constitution. |

---

*This Constitution governs all DevSync engineering. Amend it deliberately; follow it always.*
