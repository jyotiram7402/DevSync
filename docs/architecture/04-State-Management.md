# 04 — State Management Strategy

**Version:** 1.0 · **Last updated:** 2026-07-22

This document defines how DevSync manages state. The central idea: **there are three distinct kinds of state, and each is handled by the right tool.** Conflating them (a common mistake) is the root of most frontend complexity, so we separate them deliberately.

---

## 1. The Three Kinds of State

| Kind | Definition | Owner in DevSync | Source of truth |
|------|-----------|------------------|-----------------|
| **Server state** | Data that lives in the database and is merely *cached* on the client (snippets, projects, devices). | Server Components + `services/` + realtime subscription | **PostgreSQL** |
| **Global client state** | Cross-feature UI/session state with no server home (active project, sync connection status, theme, transient UI). | **Zustand** stores | The client |
| **Local component state** | State confined to one component (form fields, dialog open/close, hover). | React `useState`/`useReducer`, React Hook Form | The component |

**Prime directive:** *Server data is never "owned" by a client store as its authority.* The client holds a synchronized **cache** of server state; Postgres is the truth. This is what makes offline reconciliation and multi-device sync correct (see [07](07-Realtime-Architecture.md)).

---

## 2. Server State (the important one)

Snippets, projects, and devices are **server state**. DevSync handles it with a layered approach rather than pulling everything into a client store:

1. **Initial render:** Server Components fetch via `services/` (RLS-scoped) and render the list on the server — fast first paint, minimal JS, no client fetch waterfall.
2. **Live updates:** a **realtime subscription** (Client Component) receives Postgres change events and updates the client-side cache in place.
3. **Client-side cache:** the working set for the active view is held in a **Zustand store dedicated to synced entities** (e.g., a snippets store), populated from the server-rendered payload and kept current by realtime events and user mutations.
4. **Mutations:** create/edit/delete go through **Server Actions** ([08](08-API-Strategy.md)) with **optimistic updates** applied to the cache, then confirmed (or rolled back) by the server result and/or the echoed realtime event.

**Why not a dedicated server-cache library (e.g., a query library) at MVP?**
- Supabase Realtime already gives us push-based freshness; we don't need polling/refetch orchestration for the core loop.
- The synced-entity Zustand store + realtime + Server Actions covers fetch, cache, and invalidation for our specific push model with less machinery.
- Fewer dependencies = more predictable Vercel builds (environment constraint).
- **Revisit trigger:** if server-state caching needs (complex invalidation, many independent queries) outgrow this, adopting a dedicated data-fetching/cache library is a contained addition in `services/`/`hooks/`, not a redesign. Documented as an accepted future option.

**Deduplication & idempotency:** because both the mutation result *and* the realtime echo can update the cache, the cache-update logic is **idempotent and keyed by snippet id** — applying the same change twice is a no-op. (Full dedupe design in [07](07-Realtime-Architecture.md).)

---

## 3. Global Client State — Zustand

**What lives in Zustand (cross-feature, no server home or client-authoritative):**
- **Active project context** (which project is currently selected).
- **Sync connection status** (connected / reconnecting / offline) — drives `SyncStatusIndicator`.
- **Synced-entity working cache** (the client cache of the active view's snippets, as described above).
- **UI preferences not yet persisted server-side**, transient global flags.

**Store organization:**
- Cross-feature stores in `stores/`; single-feature stores in `features/<x>/stores/`.
- **Small, focused stores** (a store per concern) rather than one monolith — easier to reason about and to subscribe to selectively.
- Selectors are used so components re-render only on the slices they read (performance).

### Why Zustand (the decision)

We chose Zustand over the alternatives (Redux Toolkit, Jotai/Recoil, React Context alone):

| Option | Why not chosen (for DevSync) |
|--------|------------------------------|
| Redux Toolkit | Powerful but heavyweight (boilerplate, providers, middleware) for our modest global-state needs; overkill when most data is server state pushed via realtime. |
| React Context only | Fine for static/rarely-changing values (theme, session) but causes broad re-renders for frequently-updating state like a live snippet cache; not built for high-frequency updates. |
| Jotai/Recoil (atoms) | Excellent but atom-centric model is a different mental model; Zustand's store model maps more directly to our "connection status / active project / cache" concerns. |
| **Zustand (chosen)** | Minimal boilerplate, no provider required, tiny bundle, selector-based subscriptions (surgical re-renders), works cleanly with React 19/Next 15, easy to keep out of Server Components. Ideal for a small set of focused global stores. |

**Zustand fits our reality:** most of our "data" is server state kept fresh by realtime; the *genuinely global client state* is small (active project, connection status, a working cache). Zustand handles that with the least ceremony and the fewest build risks.

**Discipline rules:**
1. Zustand is **not** where authoritative server data lives — it caches it.
2. Don't put local component state in global stores (dialog open/close ≠ global).
3. Stores contain state + actions; heavy logic delegates to `services/`/hooks.
4. Never import stores into Server Components (client-only).

---

## 4. Local Component State

- **React `useState`/`useReducer`** for component-local concerns: dialog visibility, hover, local toggles, multi-step UI within a component.
- **React Hook Form** for all forms (create/edit snippet, project rename, settings): manages field state, dirty/touched, and submission, with a **Zod resolver** so the same Zod schema validates on the client and (re-validated) on the server. This keeps form state *out* of global stores and gives performant, uncontrolled-input forms.
- **Rule:** if only one component (and maybe its close children) needs it, it's local state — do not globalize it.

---

## 5. Caching Strategy (layered)

DevSync caches at multiple layers, each with a clear purpose:

| Layer | What it caches | Mechanism | Freshness |
|-------|----------------|-----------|-----------|
| **Server render** | Initial list/read payloads | Next.js RSC + route-level caching/revalidation | Revalidated on mutation via Server Actions. |
| **Client working cache** | Active-view snippets/projects | Zustand synced-entity store | Kept live by realtime events + optimistic mutations. |
| **Browser** | Static assets, fonts, images | Vercel/CDN + HTTP caching | Immutable-hashed assets; long cache. |
| **CDN/edge** | Static & cacheable responses | Vercel edge network | Per Next.js caching config. |

**Invalidation principle:** mutations trigger (a) an optimistic cache update, (b) a server confirmation that revalidates any server-cached view, and (c) a realtime echo that idempotently reconciles all devices. These three converge on the same idempotent update path, so the caches cannot drift.

---

## 6. Realtime Updates → State

The flow from a realtime event to rendered UI:

```
Supabase Realtime event (INSERT/UPDATE/DELETE, RLS-scoped)
        │
        ▼
Realtime hook (Client Component, e.g. useRealtimeSnippets)
        │  normalize event → { type, id, payload }
        ▼
Idempotent reducer on the synced-entity Zustand store (keyed by id)
        │  INSERT: upsert · UPDATE: patch · DELETE: remove
        ▼
Selector-subscribed components re-render (only affected slices)
        │
        ▼
UI updates (new SnippetCard appears / patches / disappears) + optional Sonner toast
```

**On reconnect** ([07](07-Realtime-Architecture.md)): the hook re-pulls authoritative state via `services/`, then resumes the live stream — the store is reconciled against truth, never trusted blindly after a gap.

---

## 7. State Ownership Summary (decision table)

| State | Tool | Location |
|-------|------|----------|
| Snippets/projects/devices (authority) | PostgreSQL | Supabase |
| Snippets/projects working cache | Zustand (synced-entity store) | `stores/` or feature store |
| Active project | Zustand | `stores/` |
| Sync connection status | Zustand | `stores/` |
| Theme / persisted preferences | Provider + Zustand, backed by DB preferences | `providers/` + `stores/` |
| Form state | React Hook Form (+ Zod) | Feature component |
| Dialog/hover/local toggles | `useState`/`useReducer` | Component |
| Session/auth identity | Supabase session (cookies) + auth context | `providers/` |

---

## 8. Anti-Patterns (disallowed)

- Treating a Zustand store as the *source of truth* for server data.
- Putting form or dialog state into global stores.
- Fetching server data in `useEffect` on the client when a Server Component can fetch it at render.
- One giant global store for everything (use small, focused stores).
- Bypassing `services/` to hit the Supabase client directly from components.

---

*End of State Management Strategy.*
