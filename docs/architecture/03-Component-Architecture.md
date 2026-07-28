# 03 — Component Architecture

**Version:** 1.0 · **Last updated:** 2026-07-22

This document defines the component tiers, naming and folder conventions, the Server/Client split, and the reuse strategy. It complements [02-Folder-Structure](02-Folder-Structure.md) (where components live) by defining *what kinds* of components exist and *how* they relate.

---

## 1. Component Tiers

DevSync components fall into four tiers, from most generic to most specific. Higher tiers are more reusable and more stable; lower tiers are more feature-specific and change more often.

```
Tier 1: UI Primitives (shadcn/ui)      ── most reusable, most stable
Tier 2: Shared Components               │
Tier 3: Layout Components               │
Tier 4: Feature Components             ── most specific, changes most
```

### Tier 1 — Reusable UI Primitives
- **What:** The shadcn/ui primitives we own and vendor into `components/ui/` — button, input, dialog, dropdown, tooltip, badge, skeleton, etc.
- **Characteristics:** Presentational, unaware of DevSync domain concepts, fully accessible, theme-aware. No data fetching, no business logic.
- **Why shadcn/ui (owned components, not a dependency):** We copy the primitives into our repo rather than importing a black-box library. This gives full control over styling/accessibility, avoids version-lock surprises on the Vercel build, and lets us evolve primitives without waiting on upstream — important given the no-local-build constraint (predictable, self-contained components build reliably).
- **Ownership:** `components/ui/`. Changed rarely and deliberately (they ripple everywhere).

### Tier 2 — Shared Components
- **What:** Cross-feature composites built from primitives that encode DevSync-common patterns but not a single feature: `EmptyState`, `SyncStatusIndicator`, `CopyButton`, `RelativeTime`, `ConfirmDialog`, `PageHeader`.
- **Characteristics:** Reused by ≥2 features; may accept callbacks/data via props but do not fetch data themselves.
- **Ownership:** `components/shared/`.

### Tier 3 — Layout Components
- **What:** Structural chrome: `AppShell`, `TopBar`, `ProjectSwitcher` (shell-level), `SidebarNav` (future), `AuthLayout`, `MarketingLayout`.
- **Characteristics:** Define spatial structure and navigation slots; render children; host global affordances (search entry, sync status, user menu).
- **Ownership:** `components/layout/`, composed in `app/` layouts.

### Tier 4 — Feature Components
- **What:** Components that implement a specific feature's UI: `SnippetCard`, `SnippetEditor`, `SnippetStream`, `CreateSnippetDialog`, `DeviceListItem`, `ShareLinkPanel`.
- **Characteristics:** Know DevSync domain concepts; orchestrate feature hooks/actions/state; may compose Tiers 1–3.
- **Ownership:** `features/<feature>/components/`. **Never** promoted to global folders unless genuinely reused by another feature (then it becomes Tier 2).

---

## 2. Server vs. Client Components (the critical split)

React 19 + Next.js 15 App Router: **Server Components are the default**; Client Components are opt-in. This split is an architectural decision, not an afterthought, because it drives performance, bundle size, and build correctness.

| Render as **Server Component** | Render as **Client Component** |
|-------------------------------|-------------------------------|
| Snippet list/stream initial render | Monaco editor (`SnippetEditor`) |
| Read-only snippet view (Shiki-highlighted) | Forms (React Hook Form) |
| Page/layout scaffolding, data fetching | Realtime subscription host |
| Static/marketing content | Anything using Zustand, browser APIs, clipboard |
| Search results initial render | Interactive dialogs, toasts (Sonner) |

**Rules:**
1. **Default to Server.** A component is a Client Component only if it needs interactivity, browser APIs, state, effects, or a subscription.
2. **Push the client boundary as low as possible.** Keep pages/lists as Server Components and make only the interactive leaves (a card's copy button, the editor) Client Components. This minimizes shipped JS.
3. **Never import server-only code into a Client Component** (and vice versa). The `lib/` Supabase-client split (browser vs server client) exists precisely to keep this clean.
4. **Data flows down as serializable props** from Server to Client Components.

**Why this matters for the build constraint:** the most common Next.js build failures are server/client boundary violations. Making the split explicit and disciplined is our primary defense given that Vercel is the first compiler.

---

## 3. Component Composition Pattern

A typical feature screen composes tiers top-down:

```
app/(app)/page.tsx                         [Server Component — route]
  └─ AppShell                              [Tier 3 layout]
       ├─ TopBar                            [Tier 3: search, sync status, user menu]
       └─ SnippetStream                     [Tier 4, Server: fetches + renders list]
            ├─ EmptyState                    [Tier 2, when no data]
            └─ SnippetCard (many)            [Tier 4, Server render of content]
                 ├─ Badge (type)             [Tier 1]
                 ├─ RelativeTime             [Tier 2]
                 └─ CopyButton               [Tier 2 → Client leaf]
       └─ CreateSnippetDialog                [Tier 4 → Client: RHF + Zod + editor]
```

**Principle:** Server Components own structure and data; Client Components are small interactive leaves grafted onto that structure.

---

## 4. Naming Conventions

- **Component files & names:** `PascalCase` for the component and its file (`SnippetCard.tsx`). One primary component per file.
- **Client Components:** conventionally suffixed only when disambiguation helps (e.g., `SnippetEditor.tsx` is obviously client); rely on the `"use client"` directive as the source of truth, not the filename.
- **Props types:** `PascalCase` with a `Props` suffix (`SnippetCardProps`), co-located with the component.
- **Hooks:** `useX` camelCase (`useRealtimeSnippets`).
- **Boolean props:** affirmative and prefixed (`isLoading`, `hasError`, `canEdit`).
- **Event handler props:** `on<Event>` (`onCopy`, `onDelete`); internal handlers `handle<Event>`.
- **Folders:** `kebab-case` (per [02](02-Folder-Structure.md)).

---

## 5. Folder Conventions for Components

- **Global tiers:** `components/ui/`, `components/shared/`, `components/layout/`.
- **Feature components:** `features/<feature>/components/`.
- **Co-location:** a component's tightly-coupled sub-parts, styles (Tailwind is inline so usually none), and its `Props` type live with it. Tests co-locate as `Component.test.tsx` (see [12](12-Coding-Standards.md)).
- **Index/barrel:** features expose components through the feature's public `index.ts`; global tiers may use folder barrels sparingly (mind tree-shaking).

---

## 6. Reuse Strategy

The reuse decision is governed by a **promotion rule** to prevent both premature abstraction and duplication:

```
Is the component used by only ONE feature?      → keep it in that feature (Tier 4)
Is it now needed by a SECOND feature?           → promote to components/shared (Tier 2)
Is it purely a generic primitive?               → it belongs in components/ui (Tier 1)
Is it app structure/navigation?                 → components/layout (Tier 3)
```

**Principles:**
1. **Rule of three (pragmatic):** don't abstract on first reuse hunch; promote when a real second consumer appears. Avoids speculative, wrong abstractions.
2. **Props over configuration sprawl:** shared components take data + callbacks as props; they don't fetch or know about global state. Keeps them portable and testable.
3. **Composition over inheritance:** build complex UI by composing primitives, not by deep prop-drilling or God-components.
4. **Accessibility is inherited from Tier 1:** because primitives are accessible, higher tiers stay accessible by construction (supports the WCAG AA NFR).
5. **No business logic in presentational components:** logic lives in hooks/actions/services; components render and delegate.

---

## 7. Key Feature Components (specified, not built)

| Component | Tier | Server/Client | Responsibility |
|-----------|------|---------------|----------------|
| `SnippetStream` | 4 | Server | Fetch + render the reverse-chronological list for the active project. |
| `SnippetCard` | 4 | Server (with Client leaves) | Render one snippet: preview, type badge, source device, time, copy. |
| `CopyButton` | 2 | Client | One-action clipboard copy with fallback + toast. The product's hero action. |
| `CreateSnippetDialog` | 4 | Client | RHF + Zod form; optional Monaco editor for larger content. |
| `SnippetEditor` | 4 | Client (lazy) | Monaco-based editing; dynamically imported to keep it off the critical path. |
| `SnippetView` | 4 | Server | Read-only Shiki-highlighted rendering (no editor JS shipped for reading). |
| `SyncStatusIndicator` | 2 | Client | Reflects realtime connection state (connected/reconnecting/offline). |
| `ProjectSwitcher` | 3/4 | Client | Switch/create active project; drives active-project store. |
| `DeviceListItem` | 4 | Client | Show + rename + revoke a device. |
| `ShareLinkPanel` | 4 | Client `[v1.1]` | Generate/expire/revoke a read-only share link. |

**Editor/highlight split rationale:** **Monaco** (heavy, interactive) is used only for *editing* and is lazy-loaded; **Shiki** renders *read* views on the server so viewing a snippet ships near-zero editor JS. This directly serves the performance strategy ([11](11-Performance-Strategy.md)).

---

## 8. Anti-Patterns (explicitly disallowed)

- Data fetching inside Tier 1/2 shared components.
- Reaching into another feature's internal components (import only via the feature's public surface).
- Marking a whole page `"use client"` to fix one interactive child (push the boundary down instead).
- God-components that mix data, state, and presentation.
- Prop-drilling global concerns (use a store/provider) — but not overusing global state for what is local ([04](04-State-Management.md)).

---

*End of Component Architecture.*
