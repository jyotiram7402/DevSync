# 12 — Coding Standards

**Version:** 1.0 · **Last updated:** 2026-07-22

These standards make the codebase consistent, reviewable, and — critically for the no-local-build constraint — **statically reasonable so it compiles correctly on the first Vercel build.** They are conventions, not code; examples are illustrative snippets of *style*, not application implementation.

Automated enforcement (ESLint + Prettier + strict TypeScript + type-checking in CI on Vercel) backs these rules so they are not left to memory.

---

## 1. TypeScript

- **`strict` mode on**, always. No implicit `any`. `noUncheckedIndexedAccess` enabled.
- **`any` is banned** in application code; use `unknown` + narrowing when a type is genuinely unknown. `any` requires an inline justification comment and a reviewer's approval (rare).
- **Types inferred from Zod** for all validated inputs ([08](08-API-Strategy.md)) — never hand-maintain a type that duplicates a schema.
- **Database types are generated** ([06](06-Database-Strategy.md)) and consumed via `types/`/`services/` — never hand-typed to match the DB.
- **Prefer `type` aliases** for unions/shapes; `interface` acceptable for extendable object contracts — be consistent within a file.
- **Discriminated unions** for results/states (the `{ ok: true } | { ok: false }` Result contract, [08](08-API-Strategy.md)) so handling is exhaustive and checkable.
- **No non-null assertions (`!`)** except with a justification; prefer explicit narrowing.
- **`readonly`** for data that shouldn't mutate; avoid mutating shared objects.
- **Exhaustive `switch`** on enums/unions with a `never` guard in the default case (catches missed cases at build time).

---

## 2. React

- **Server Components by default; `"use client"` only when required** ([03](03-Component-Architecture.md)). The directive is the source of truth for the boundary.
- **Function components only**; no class components (except React Error Boundaries where required).
- **Hooks obey the rules of hooks** (top level, no conditionals) — enforced by lint.
- **One primary component per file**, named `PascalCase`, matching the filename.
- **Props are explicitly typed** (`XxxProps`), destructured in the signature.
- **No business logic in components** — delegate to hooks/`services/`/actions ([03](03-Component-Architecture.md)).
- **Keys** on lists use stable entity ids (snippet UUID), never array index.
- **Effects are a last resort** — prefer server fetching, derived state, and event handlers; every `useEffect` needs a clear reason (subscriptions, imperative browser APIs).
- **Error boundaries** around risky client widgets and per route segment ([09](09-Error-Handling.md)).

---

## 3. Naming

| Thing | Convention | Example |
|-------|------------|---------|
| Component / component file | `PascalCase` | `SnippetCard.tsx` |
| Hook | `useCamelCase` | `useRealtimeSnippets` |
| Server Action | `camelCase` verb | `createSnippet` |
| Variable / function | `camelCase` | `activeProjectId` |
| Type / interface / enum | `PascalCase` | `SnippetType`, `ActionResult` |
| Constant (true constant) | `UPPER_SNAKE_CASE` | `MAX_SNIPPET_LENGTH` |
| Boolean | affirmative prefix | `isLoading`, `hasError`, `canEdit` |
| Event handler prop / fn | `onX` / `handleX` | `onCopy` / `handleCopy` |
| Folder | `kebab-case` | `features/snippets` |
| Zod schema | `xxxSchema` | `createSnippetSchema` |

**Rule:** names reveal intent and domain (`snippet`, `project`, `device`), matching the ubiquitous language of the PRD.

---

## 4. Components (structural rules)

- Compose from lower tiers ([03](03-Component-Architecture.md)); don't reinvent primitives.
- Presentational components take data + callbacks via props; they don't fetch or read global stores.
- Keep components small; extract sub-components when a file grows past comfortable reading length or mixes concerns.
- No inline anonymous mega-functions in JSX; extract handlers.
- Tailwind classes are the styling mechanism; extract repeated class sets into shared components, not copy-paste.

---

## 5. Hooks

- Custom hooks encapsulate reusable stateful logic (subscriptions, clipboard, debounced values).
- Feature-specific hooks live in the feature; cross-feature hooks in `hooks/` ([02](02-Folder-Structure.md)).
- A hook does one thing; compose hooks rather than building one giant hook.
- Hooks return typed values; document non-obvious return contracts.

---

## 6. Files & Folders

- **Feature-first placement** ([02](02-Folder-Structure.md)); shared code promoted only on real reuse.
- One primary export per file (component/hook/schema); small related helpers may co-locate.
- **Import only via a feature's public surface** (`index.ts`) from outside that feature; never deep-import another feature's internals.
- Co-locate tests (`X.test.ts(x)`) beside the code they test.
- Route files (`app/`) stay thin — composition only, no business logic.

---

## 7. Imports

- **Order:** external packages → internal absolute aliases (`@/features`, `@/components`, `@/lib`, …) → relative imports; a blank line between groups (lint-enforced).
- **Absolute path aliases** for cross-area imports (configured in tsconfig); relative imports only within a folder.
- **No circular imports** (lint-enforced); if two modules need each other, extract shared code to a leaf layer (`utils`/`types`).
- **Type-only imports** use `import type` (helps bundling and clarity).
- **Avoid deep barrel chains** that hurt tree-shaking/build performance ([02](02-Folder-Structure.md)).

---

## 8. Comments

- **Explain *why*, not *what*.** The code says what; comments capture intent, trade-offs, and non-obvious constraints.
- **Document decisions inline** where a choice is surprising (e.g., "LWW here because … see 07-Realtime").
- **Public/shared functions and services** get a short doc comment describing contract, params, and error behavior.
- **No commented-out code** in merged branches (git history is the archive).
- **`TODO`/`FIXME`** include an owner/context and, ideally, a tracking reference; stale TODOs are cleaned in review.
- Match the surrounding file's comment density and style.

---

## 9. Functions

- **Small, single-responsibility, pure where possible** (especially in `utils/` — no side effects).
- **Explicit return types** on exported functions (aids the compiler and readers; supports static reasoning).
- **Guard clauses / early returns** over deep nesting.
- **No side effects in render**; side effects belong in actions/handlers/effects.
- **Arguments:** prefer a typed options object when a function takes more than ~3 parameters.
- **Async:** always handle rejection paths; return the typed Result rather than throwing across boundaries ([08](08-API-Strategy.md)).

---

## 10. Error Handling (coding rules; strategy in [09](09-Error-Handling.md))

- **Return typed results; don't throw across boundaries.** Callers must handle `ok:false` (enforced by the discriminated union).
- **Never swallow errors silently** — log server-side (sanitized) or surface to the user.
- **Never expose internals** (stack traces, DB text) to the client.
- **Never log sensitive content** ([09](09-Error-Handling.md), [10](10-Security-Architecture.md)).
- **Wrap risky client widgets** in error boundaries.

---

## 11. Testing

Testing is scoped pragmatically for a small team, concentrated where correctness matters most.

| Layer | What & why |
|-------|-----------|
| **Unit** | Pure logic in `utils/`, Zod schemas, and the **idempotent realtime reducer** ([07](07-Realtime-Architecture.md)) and **cache-apply logic** — the correctness-critical pure functions. Highest ROI, run fast in CI. |
| **Integration** | `services/` against RLS behavior (owner can read own / cannot read others), Server Actions' authn→validate→service pipeline. Guards the security-critical path. |
| **Component** | Key interactive components (CopyButton, CreateSnippetDialog, SyncStatusIndicator) with a component testing tool. |
| **E2E (post-MVP)** | The core loop across two simulated devices (create → appears → copy), auth, and reconnection — the flows the MVP acceptance bar depends on. |

**Principles:**
- **Prioritize the sync-correctness and security paths** — these are where a bug is most damaging (data loss / leakage).
- Tests run **in CI on Vercel/GitHub** (no local runtime) — they must be environment-independent and deterministic.
- **Test behavior, not implementation**; avoid brittle snapshot overuse.
- Idempotency, reconciliation, and RLS isolation deserve explicit test cases because they cannot be manually verified locally under the environment constraint.

---

## 12. Formatting & Tooling

- **Prettier** for formatting (non-negotiable, no style debates in review).
- **ESLint** with TypeScript + React + import rules; lint must pass to merge.
- **Type-check in CI** (`tsc --noEmit` equivalent step) so type errors are caught before/at the Vercel build.
- **Conventional commits + PR checks** ([13](13-Git-Strategy.md)) gate merges.
- **These run in CI**, not on the restricted local machine — consistent with the environment constraint.

---

## 13. Why These Standards Fit DevSync

- **Static-first rules (strict TS, explicit returns, exhaustive unions, no hidden throws)** maximize the chance the first Vercel build is clean — directly addressing the environment constraint.
- **Server/client discipline** prevents the most common Next.js build failures.
- **Feature-first + public-surface imports** keep the codebase modular as the roadmap grows.
- **Testing focus on sync + RLS** targets the two highest-severity risk areas (data loss, data leakage).

---

*End of Coding Standards.*
