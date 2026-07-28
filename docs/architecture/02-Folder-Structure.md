# 02 — Feature-Based Folder Structure

**Version:** 1.0 · **Last updated:** 2026-07-22

This document defines the repository's top-level structure, the reasoning for each folder, and **ownership rules** that keep the codebase cohesive as it grows. The organizing philosophy is **feature-first**: code is grouped by product capability (a "feature"), not by technical type. Shared/technical concerns live in clearly bounded global folders.

> This is a structural specification, not code. No files are generated here.

---

## 1. Guiding Principle: Feature-First

**Why feature-based over type-based** (e.g., grouping all components together, all hooks together):
- A feature (say, *snippets*) keeps its components, hooks, actions, stores, and types **together**, so a developer changing snippet behavior touches one cohesive area instead of hopping across ten type-folders.
- Features become **independently understandable and evolvable** — closer to how the PRD/roadmap adds capability (snippets → projects → sharing → collections → teams).
- It scales: adding *teams* in v3 means adding a `features/teams/` module, not threading team code through global folders.

**The rule:** *If code belongs to exactly one feature, it lives in that feature. If it is genuinely shared by two or more features (or is app-infrastructure), it lives in a global folder.*

---

## 2. Top-Level Structure

```
devsync/
├── app/                  # Next.js App Router: routing, layouts, pages, route handlers
├── components/           # Cross-feature shared UI (incl. shadcn/ui primitives)
├── features/             # Feature modules (the heart of the codebase)
├── hooks/                # Cross-feature shared React hooks
├── lib/                  # Framework/library setup & low-level clients (Supabase, etc.)
├── providers/            # React context providers (composed at the root)
├── services/             # Data-access layer: typed functions wrapping Supabase calls
├── stores/               # Cross-feature Zustand stores (global UI/session state)
├── supabase/             # DB migrations, RLS policies, seed, generated DB types
├── styles/               # Global styles, Tailwind layer, theme tokens
├── types/                # Global/shared TypeScript types
├── utils/                # Pure, dependency-light helper functions
├── public/               # Static assets served as-is
└── docs/                 # Product + architecture documentation (this blueprint)
```

---

## 3. Folder-by-Folder Purpose & Ownership

### `app/` — Routing & composition only
- **Purpose:** Next.js App Router surface — route segments, `layout`/`page`/`loading`/`error` boundaries, route groups (e.g., a `(marketing)` group and an `(app)` authenticated group), and **Route Handlers** (OAuth callback, public share route, health).
- **Ownership rule:** `app/` **composes** features; it does not **contain business logic**. A `page` fetches via `services/` and renders `features/*` components. Keep route files thin. Route handlers delegate to `services/`.
- **Why:** Keeping routing thin means the same feature can be reused across routes and the routing layer stays readable.

### `components/` — Cross-feature shared UI
- **Purpose:** UI reused by **multiple** features: shadcn/ui primitives (button, dialog, input…), layout chrome (top bar, shells), and shared presentational components (empty state, sync-status indicator).
- **Ownership rule:** A component earns a place here only when **two or more features** use it, or it is app-wide chrome. Single-feature components live in that feature. No business logic or data fetching here — presentational + interaction only.
- **Sub-structure:** `components/ui/` (shadcn primitives), `components/layout/` (shells, bars), `components/shared/` (cross-feature composites).

### `features/` — The heart of the app
- **Purpose:** One folder per product capability. Proposed modules (aligned to the roadmap):
  ```
  features/
  ├── auth/          # sign-in UI, session helpers specific to auth screens
  ├── snippets/      # create/view/edit/delete/copy snippet UI + logic
  ├── projects/      # project switcher, project views
  ├── search/        # search UI + query orchestration
  ├── devices/       # device list, revoke
  ├── settings/      # profile, preferences, data & privacy
  ├── sharing/       # [v1.1] share-link creation + public view pieces
  ├── collections/   # [v2]
  └── teams/         # [v3]
  ```
- **Internal shape of a feature** (consistent across all features):
  ```
  features/snippets/
  ├── components/    # UI used only by snippets
  ├── hooks/         # hooks used only by snippets (e.g., realtime subscription)
  ├── actions/       # Server Actions for snippet mutations
  ├── stores/        # Zustand store(s) local to snippets, if any
  ├── schemas/       # Zod schemas for snippet inputs
  ├── types.ts       # types owned by the snippets feature
  └── index.ts       # public surface of the feature (barrel — see rule below)
  ```
- **Ownership rule:** A feature **owns everything used only by it**. Features communicate through their **public surface** (`index.ts`) and through shared global layers (`services/`, `stores/`, `types/`) — **never by reaching into another feature's internals**. If `snippets` needs something from `projects`, it imports from `features/projects` (its index), not from a deep internal path.
- **Why:** Enforces modularity, prevents tangled cross-feature coupling, and makes each feature independently testable and removable.

### `hooks/` — Cross-feature shared hooks
- **Purpose:** Reusable React hooks used by multiple features (e.g., `useMediaQuery`, `useClipboard`, `useDebouncedValue`).
- **Ownership rule:** Feature-specific hooks stay in the feature. Only genuinely shared, feature-agnostic hooks live here.

### `lib/` — Library setup & low-level clients
- **Purpose:** Initialization and configuration of external libraries and clients: Supabase client factories (browser client, server client, middleware client), Shiki highlighter setup, constants, and other framework glue.
- **Ownership rule:** `lib/` holds **how we talk to tools**, not **business rules**. It is imported by `services/` and providers, not directly scattered through feature UI. No React components here.
- **Why:** Centralizes the tricky server/client Supabase-client distinction (a common Next.js pitfall) in one audited place.

### `providers/` — React context providers
- **Purpose:** App-level context providers (theme provider, toast/Sonner provider, session/auth context, realtime connection provider) composed at the root layout.
- **Ownership rule:** Providers wire cross-cutting context; they contain minimal logic and delegate to `lib/`/`services/`/`stores/`. Feature-specific context that isn't app-wide stays in the feature.

### `services/` — Data-access layer
- **Purpose:** Typed functions that wrap all Supabase data operations (read/write for snippets, projects, devices, etc.). This is the **only** layer that talks to the database client directly.
- **Ownership rule:** UI and Server Actions call `services/`; they never call the Supabase client inline. Services return typed results and typed errors. Services contain **data access**, not UI and not cross-cutting business orchestration (that lives in feature actions/hooks).
- **Why:** A single, thin abstraction over the backend means (a) consistent RLS-respecting access, (b) one place to change if the backend ever migrates (mitigates vendor lock-in), and (c) easy typing against generated DB types.

### `stores/` — Cross-feature Zustand stores
- **Purpose:** Global client state used across features (e.g., active-project context, sync-connection status, UI preferences not yet persisted).
- **Ownership rule:** Only **cross-feature** state lives here; single-feature state lives in `features/<x>/stores`. Stores hold client/UI state — **never** the authoritative copy of server data (that's server state; see [04](04-State-Management.md)).

### `supabase/` — Database as code
- **Purpose:** Version-controlled database artifacts: **migrations**, **RLS policy definitions**, **seed data**, and **generated database TypeScript types**. (These are produced/applied through Supabase tooling by the deploying human, consistent with the no-local-CLI constraint — the folder is their home in the repo.)
- **Ownership rule:** All schema/policy change flows through here so the database has a reviewable history. Generated DB types here are consumed by `services/` and `types/`.
- **Note:** This document does not create these files (no SQL per the task); it reserves and explains the folder.

### `styles/` — Global styling
- **Purpose:** Global CSS entry, Tailwind base/components/utilities layering, theme tokens (light/dark), and any global keyframes.
- **Ownership rule:** Component-specific styling uses Tailwind utilities inline; only truly global styles/tokens live here.

### `types/` — Global shared types
- **Purpose:** Types shared across features and layers (domain types re-exported from generated DB types, common API result/error shapes, shared enums like snippet type).
- **Ownership rule:** Feature-owned types stay in the feature. Only cross-cutting types live here. This folder depends on nothing app-specific (leaf of the dependency graph).

### `utils/` — Pure helpers
- **Purpose:** Small, pure, dependency-light functions (date formatting, string helpers, type guards, id helpers).
- **Ownership rule:** **No side effects, no React, no Supabase.** If a helper needs a client or context, it belongs in `services/`/`hooks/`, not here. Keeps `utils/` trivially testable and reusable.

### `public/` — Static assets
- **Purpose:** Files served verbatim (favicon, static images, `og` images, `robots`, manifest).
- **Ownership rule:** Only static, public, non-sensitive assets.

### `docs/` — Documentation
- **Purpose:** The product blueprint and this architecture set; future ADRs (Architecture Decision Records) and runbooks.
- **Ownership rule:** Docs are first-class; significant decisions are recorded here (an `adr/` subfolder is recommended going forward).

---

## 4. Dependency Direction (who may import whom)

To prevent tangled dependencies, imports flow in **one direction**:

```
app/  ──▶ features/ ──▶ services/ ──▶ lib/
  │           │            │
  │           ▼            ▼
  └──▶ components/     types/, utils/  (leaf layers — depend on nothing app-specific)
              │
              ▼
        hooks/, providers/, stores/  (shared, may use lib/services)
```

**Rules:**
1. `utils/` and `types/` are **leaves** — they import nothing app-specific.
2. `services/` may use `lib/`, `types/`, `utils/` — never `features/` or `components/`.
3. `features/` may use `services/`, `components/`, `hooks/`, `stores/`, `providers/`, `types/`, `utils/` — but **not** other features' internals (only their public `index.ts`).
4. `app/` composes everything but holds no business logic.
5. **No circular dependencies.** If two features need shared logic, promote it to a global layer.

---

## 5. Barrel / Public-Surface Rule

Each feature exposes a **single public entry** (`features/<x>/index.ts`) that re-exports only what other parts of the app may use. Internal files are private by convention.
- **Why:** enforces the module boundary, makes refactoring internals safe, and documents each feature's contract.
- **Caveat:** keep barrels shallow and avoid barrel files for `app/` route trees (to protect Next.js tree-shaking and build performance).

---

## 6. Naming Conventions (folder-level; file-level in [12](12-Coding-Standards.md))

- Folders: `kebab-case` (`features/snippets`, `components/ui`).
- Feature names: singular product concept where natural, but plural is acceptable for collections of entities (`snippets`, `projects`, `devices`) — **be consistent**; the roadmap entities are plural.
- Route groups in `app/`: parenthesized for organization without affecting the URL (e.g., `(marketing)`, `(app)`).

---

## 7. Why This Structure Serves DevSync Specifically

- The **roadmap maps 1:1 to feature folders** — each new phase (sharing, collections, teams) is a new, isolated module.
- The **`services/` boundary** directly mitigates the vendor lock-in risk (one place to change if Supabase is ever replaced).
- The **server/client discipline** (features declaring client vs server components, `lib/` centralizing client factories) reduces the Next.js build errors most likely to bite us given the no-local-build constraint.
- The **leaf `utils`/`types`** keep the most-reused code trivially safe to build and test.

---

*End of Folder Structure.*
