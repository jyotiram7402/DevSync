# DevSync — Information Architecture (IA)

**Version:** 1.0
**Last updated:** 2026-07-22

This document defines the **logical structure** of DevSync: how concepts relate, how the app is navigated, and how information is organized. It is conceptual, not a database schema and not a folder structure. It exists so that navigation, screens, and future data modeling stay consistent.

---

## 1. Core Concepts and Their Relationships

The product is built on a small, deliberately minimal set of concepts:

```
Account (User)
  ├── owns → Devices           (the machines that sync)
  ├── owns → Projects          (top-level organizational context)
  │             └── contains → Snippets
  ├── owns → Snippets          (the atomic unit of value)
  ├── owns → Collections [v2]  (cross-project grouping of snippets)
  ├── owns → Share Links [v1.1](read-only external access to a snippet)
  └── belongs to → Team Workspaces [v3]
                        ├── has → Members (with Roles)
                        └── has → Shared Collections → Snippets
```

**Conceptual definitions:**

- **Account:** A single human identity, authenticated via one or more OAuth providers. The root of ownership. All private data hangs off an account.
- **Device:** A registered client (browser/machine) authorized to sync on the account. Sync happens between an account's devices.
- **Snippet:** The atomic unit — a piece of text (error, trace, log, code, command, note) with metadata (title, type, source device, timestamps, project). This is the product's center of gravity.
- **Project:** The primary organizational container. Every snippet lives in exactly one project. A default **Inbox** project always exists so users never must create a project to be productive.
- **Collection [v2]:** A cross-cutting grouping. A snippet can appear in multiple collections without changing its project. Projects answer "which context?"; collections answer "which theme/topic?".
- **Share Link [v1.1]:** A revocable, expiring, read-only pointer to a single snippet for external viewing.
- **Team Workspace [v3]:** A shared space with members, roles, and shared collections. Personal snippets never enter a workspace unless explicitly shared.

**Key invariants:**
1. A snippet belongs to exactly one account and exactly one project.
2. A snippet is private by default; visibility only widens through explicit sharing.
3. Devices never own data — they are access points to the account's data.

---

## 2. Navigation Architecture

DevSync uses a **hub-and-spoke** model with the Snippet Stream (Dashboard) as the hub.

### Primary navigation (always reachable)
- **Project switcher** (top-left): switch active project / create project. This is the main organizational control.
- **Search** (top-center): global entry to find any snippet.
- **New snippet** (prominent, plus keyboard shortcut): the most common action.
- **Sync status** (top): connected / reconnecting / offline — always visible for trust.
- **User menu** (top-right): profile, settings, sign out; later: workspace switcher.

### Secondary navigation
- **Settings** sub-sections (Devices, Profile, Preferences, Data & Privacy, Billing[future]).
- **Notifications** [v1.1+].
- **Analytics** [v2].
- **Team workspace** switcher and its sub-navigation [v3].

### Navigation principles
1. **The core loop is never more than one action away.** Create, copy, and search are top-level.
2. **Organization is optional and lateral,** not a gate. Users move *between* projects; they never have to *set up* organization to start.
3. **Depth is shallow.** Most tasks are reachable within one or two levels. Settings is the only deeper area.
4. **Context is always visible.** The active project and sync state are persistent on screen.

---

## 3. Projects

- **Role:** The primary axis of organization — typically maps to a repo, client, course, or workstream.
- **Default Inbox:** Auto-created per account; the landing context for zero-setup capture. Cannot be deleted (it is the safety net for un-categorized snippets).
- **Behavior:**
  - New snippets default to the active project.
  - Snippets can be moved between projects.
  - Deleting a project prompts for snippet disposition (default: move to Inbox) — never silent data loss.
- **Why projects (not just tags) at MVP:** Developers think in terms of "which project am I in." A single strong container is simpler and more intuitive at MVP than a free-form tag system, and it maps cleanly to the freelancer "never mix clients" need. Tags/collections come later as an additive, lateral axis.

---

## 4. Snippets

- **Role:** The atomic unit of value; everything else exists to create, move, find, and organize snippets.
- **Conceptual attributes:** content; optional title; type (error / stack trace / log / code / command / plain text); source device; project; timestamps; (later) tags, pinned status, collections.
- **Type:** Drives scannability (badges/icons) and, later, AI enrichment and smart search. At MVP, type is user-selected with a suggested default; auto-detection is a v1.1 heuristic.
- **Lifecycle:** create → sync → (view/copy) → (edit metadata) → (share[v1.1]) → delete (propagates everywhere).
- **Ordering:** Reverse-chronological by default (most recent first), because the freshest error is usually the one being debugged.

---

## 5. Collections `[v2]`

- **Role:** A lateral, cross-project grouping (e.g., "Docker gotchas," "Useful prompts") independent of project context.
- **Relationship:** Many-to-many with snippets. A snippet keeps its single project but can join multiple collections.
- **Why deferred:** Collections only earn their keep once a user has accumulated a corpus large enough that the single-project axis is insufficient. Introducing them at MVP adds conceptual weight before it is needed.

---

## 6. Search

- **Scope:** Full-text over snippet content and titles, plus structured filters (project, type, date). Searches the active user's data only.
- **Placement:** Global, top-level — search is a first-class navigation method, not buried.
- **Behavior:** Live, ranked results; combinable filters; scales via server-side full-text indexing and pagination.
- **Future:** Fuzzy matching, tag/collection filters, and semantic/AI search as the corpus and roadmap mature.

---

## 7. Notifications

- **MVP:** None beyond inline sync-state indicators.
- **v1.1:** In-app arrival notifications ("New snippet from *Work Laptop*") — closes the perceptual loop of sync.
- **v2+:** A Notifications Center; optional browser push; later, team-activity notifications.
- **Principle:** Notifications must never become noise; batching and user control are required from the first version.

---

## 8. Settings

Organized into clearly separated sections so destructive actions are isolated:
- **Profile:** identity from OAuth; connected providers.
- **Devices:** the device registry; rename/revoke.
- **Preferences:** theme, defaults (project/type), keyboard shortcuts.
- **Data & Privacy:** bulk delete, account deletion, export (future), privacy policy.
- **Billing [future]:** plan and payment (delegated to a payment provider).

**Principle:** Settings is the only "deep" area; everything reversible is grouped, and everything destructive requires explicit confirmation.

---

## 9. Profile

- Sourced from the OAuth provider (name, avatar, email).
- Shows connected identity providers (GitHub/Google).
- Read-mostly at MVP; provider linking and profile editing are future enhancements.
- **Rationale:** With OAuth-only auth, the profile is largely a mirror of the provider — DevSync avoids becoming a system of record for identity data it doesn't need to own.

---

## 10. Analytics `[v2]`

- **User-facing:** personal usage insights (snippets over time, top types, busiest projects, device activity).
- **Internal (product):** activation, engagement, retention, and reliability metrics (see PRD §17) — instrumented from MVP for the team, surfaced to users later.
- **Principle:** User analytics are derived from the user's own data only; they build value awareness that supports future monetization.

---

## 11. Device Management

- **Role:** The trust and control center for "what can see my data."
- **Behavior:** list devices (name, platform, last active, current); rename; revoke.
- **Revocation:** immediate — invalidates access and closes the realtime channel for that device; reflected live across the user's other devices.
- **Why first-class from MVP:** Since sync is inherently multi-device, and content is sensitive, users must always be able to answer "which machines have access?" and cut one off instantly.

---

## 12. IA Consistency Rules (for future work)

1. **Ownership flows from the account.** Any new concept must attach clearly to an account (and, for shared concepts, a workspace).
2. **Private by default.** Any new sharing/visibility feature must default to the most private option.
3. **One primary container (Project), lateral groupings (Collections).** Don't add competing "primary" hierarchies.
4. **Search is universal.** Any new content type must be searchable.
5. **Sync state is always visible.** Any new realtime surface must expose its connection state.
6. **Destructive actions are isolated and confirmed.** No new flow may make deletion easy to trigger accidentally.

---

*End of Information Architecture.*
