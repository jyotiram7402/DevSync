# DevSync — Development Roadmap (Engineering Sprints)

**Version:** 1.0
**Last updated:** 2026-07-22

This document translates the product roadmap into professional engineering sprints. Each sprint lists: **Goal**, **Deliverables**, **Dependencies**, **Complexity**, and **Expected Outcome**.

**Assumptions for planning:**
- Sprint length is treated as ~2 weeks of focused work (adjust to team capacity).
- **Environment reality:** all builds occur on Vercel via GitHub → Vercel; there is no local build/run. Therefore each sprint must produce **build-clean, production-ready** output validated by static reasoning and by the Vercel build itself. Sprints explicitly budget for "fix based on Vercel build logs" cycles.
- Complexity is rated **Low / Medium / High** relative to a small senior team.

The MVP is delivered across **Sprints 0–6**. Later sprints outline v1.1 → v3.

---

## Sprint 0 — Foundation & Pipeline

- **Goal:** Establish a build-clean skeleton that deploys to Vercel and connects to Supabase, so every later sprint ships on a known-good pipeline.
- **Deliverables:**
  - Project scaffolding (Next.js + TypeScript + Tailwind + shadcn/ui) that builds cleanly on Vercel.
  - GitHub → Vercel deployment pipeline verified (first successful production build).
  - Supabase project provisioned; environment configuration wired (via Vercel env vars).
  - Baseline layout shell (top bar, empty routes) and theme setup.
  - Engineering conventions documented (typing, folder boundaries between data/realtime/UI layers).
- **Dependencies:** Supabase + Vercel accounts; GitHub repo. No product dependencies.
- **Complexity:** Medium (first build correctness is critical given no local builds).
- **Expected Outcome:** A deployed "hello, authenticated shell" that proves the toolchain and pipeline end-to-end. **De-risks the entire environment constraint up front.**

---

## Sprint 1 — Authentication & Accounts

- **Goal:** Users can sign in with GitHub or Google and reach an authenticated app shell.
- **Deliverables:**
  - GitHub OAuth and Google OAuth via Supabase Auth.
  - Session handling (persist, restore, sign out).
  - Account creation on first sign-in; unified identity by verified email where possible.
  - Protected routes / redirect logic for unauthenticated access.
  - Landing page (A1) + OAuth callback (A2) + basic legal pages (A4).
- **Dependencies:** Sprint 0 (pipeline, Supabase).
- **Complexity:** Medium (OAuth redirect correctness; must work on first Vercel deploy).
- **Expected Outcome:** A real user can sign in and land in an empty authenticated dashboard. Identity foundation for all data.

---

## Sprint 2 — Data Model, RLS & Snippet CRUD

- **Goal:** Users can create, view, edit-metadata, and delete their own snippets, fully isolated by Row-Level Security.
- **Deliverables:**
  - Conceptual data model realized: accounts, projects (incl. default Inbox), snippets, devices.
  - **Row-Level Security policies** enforcing per-user isolation (security-critical; reviewed carefully).
  - Snippet CRUD: create (B3), stream view (B1 baseline), detail/edit (B2), delete with confirmation.
  - Default Inbox project auto-provisioned per account.
- **Dependencies:** Sprint 1 (accounts/identity).
- **Complexity:** High (RLS correctness is a security cornerstone; get it right and prove it with static reasoning + test scenarios).
- **Expected Outcome:** A single user can manage snippets end-to-end, with data provably isolated. The persistence backbone is complete.

---

## Sprint 3 — Realtime Sync (the core loop)

- **Goal:** Create/update/delete on one device propagates to the user's other devices in near-real-time.
- **Deliverables:**
  - Supabase Realtime subscription scoped per-user (RLS-aligned).
  - Persist-then-broadcast behavior; live insert/patch/remove in the snippet stream.
  - Newly arrived snippet highlight (E-series receive behavior).
  - Sync-status indicator (connected/reconnecting/offline) (E2 baseline).
- **Dependencies:** Sprint 2 (data model + RLS + CRUD).
- **Complexity:** High (this is the product; correctness and latency matter most here).
- **Expected Outcome:** The "aha" moment works: a snippet created on Device A appears on Device B within ~1 second. Core hypothesis becomes demonstrable.

---

## Sprint 4 — Offline Reconciliation & Reliability

- **Goal:** Guarantee no lost or duplicated snippets across disconnects — the trust-critical hardening of Sprint 3.
- **Deliverables:**
  - Reconnect + state re-sync against source of truth on channel drop / app reopen.
  - Idempotent application of changes (no duplicates on redelivery).
  - Offline creation queue with "pending sync" indication; flush on reconnect.
  - Robust offline/reconnecting/error states (E2 completed).
- **Dependencies:** Sprint 3 (realtime).
- **Complexity:** High (edge cases are the hard part; extensive scenario reasoning required since no local runtime).
- **Expected Outcome:** Sync is trustworthy under real-world flaky networks and device sleep. Meets the "no silent data loss" NFR.

---

## Sprint 5 — Projects, History & Search

- **Goal:** Users can organize snippets into projects and find any past snippet quickly.
- **Deliverables:**
  - Project switcher + project view (B5); create/rename/delete with snippet-disposition prompt.
  - Move snippet between projects.
  - History (chronological) + full-text search (B4) over content/title.
  - Filters: project, type, date range; pagination/virtualization for large lists.
- **Dependencies:** Sprint 2 (data model), Sprint 3 (live updates reflected in views).
- **Complexity:** Medium.
- **Expected Outcome:** DevSync becomes a searchable memory, not just a pipe. Freelancer client-separation need is met.

---

## Sprint 6 — Devices, Settings & MVP Hardening

- **Goal:** Complete device management, settings, trust surfaces, and polish to hit the MVP acceptance bar.
- **Deliverables:**
  - Device registration finalized; device list with rename/revoke (C2); immediate revocation (access + channel).
  - Settings sections: Profile (C3), Preferences (C4, incl. theme + defaults), Data & Privacy (C5, bulk delete + account deletion).
  - Empty states (E1), 404 (E3), keyboard shortcuts (Should-have) if within budget.
  - Product instrumentation (activation/engagement/reliability metrics).
  - Full pass against the **MVP Acceptance Bar** (MVP Definition §"Definition of done").
- **Dependencies:** Sprints 1–5.
- **Complexity:** Medium.
- **Expected Outcome:** **MVP complete** and ready for internal alpha → private beta. All ten acceptance criteria satisfied.

---

## Sprint 7 — v1.1: Sharing & Notifications

- **Goal:** Enable safe external sharing and close the perceptual sync loop.
- **Deliverables:**
  - Share links: read-only, expiring, revocable, single-snippet (A3 public view + owner controls in B2).
  - In-app arrival notifications (E4 baseline).
  - Pin/favorite snippets; type auto-detection heuristic; onboarding polish.
- **Dependencies:** Stable MVP (Sprints 1–6).
- **Complexity:** Medium (share links widen the security surface — careful handling of the public route).
- **Expected Outcome:** v1.1 released; first low-risk sharing capability and stickier UX.

---

## Sprint 8 — v2 Part 1: Collections & Analytics

- **Goal:** Deepen organization and self-insight for power users.
- **Deliverables:**
  - Collections (cross-project, many-to-many) with UI to add/remove.
  - Personal analytics dashboard (E5).
  - Advanced search (tags/collections/fuzzy).
- **Dependencies:** Mature corpus from MVP+v1.1 usage.
- **Complexity:** Medium.
- **Expected Outcome:** DevSync feels like a workspace; foundations for value-based monetization.

---

## Sprint 9 — v2 Part 2: Browser Extension

- **Goal:** Reduce capture friction to a single keystroke from anywhere.
- **Deliverables:**
  - Browser extension for one-action capture into DevSync.
  - Store submission/review readiness; secure auth handoff from extension to account.
  - Browser push notifications.
- **Dependencies:** Stable web product + settled snippet model.
- **Complexity:** High (separate distribution channel, store review, cross-context auth).
- **Expected Outcome:** Capture friction largely eliminated; broader daily usage.

---

## Sprint 10+ — v3: Teams & Platform

- **Goal:** Expand to teams and open the platform.
- **Deliverables (phased across multiple sprints):**
  - Team workspaces (D1), members & roles (D2), shared collections (D3).
  - Billing/seats integration (delegated payment provider; DevSync never stores raw card data).
  - Public API + webhooks; audit log.
  - (Later) native/desktop helper for global clipboard capture.
- **Dependencies:** Proven individual retention; settled, versioned data contracts; monetization decision.
- **Complexity:** High (permissions, billing, abuse vectors, API versioning).
- **Expected Outcome:** DevSync becomes team infrastructure with a revenue engine and an ecosystem foundation.

---

## Cross-Sprint Engineering Practices

1. **Build-clean-first mindset.** Because Vercel is the first (and only) build environment, every PR is reasoned about statically for build correctness before merge; a "fix from Vercel build logs" loop is expected and budgeted, especially in Sprints 0–3.
2. **Security reviews on data-touching sprints.** Sprints 2, 3, 4, and 7 (RLS, realtime scoping, reconciliation, share links) get explicit security review before release.
3. **Feature flags for risky changes.** Anything that could affect the core loop ships behind a flag.
4. **Small, reversible releases.** Continuous deployment; each sprint ends deployable.
5. **Instrument early.** Metrics land in Sprint 6 but hooks are added as features are built, so beta produces real activation/retention/reliability data.
6. **Free-tier watch.** Monitor Supabase/Vercel usage from beta onward; a Pro tier is prepared before limits are threatened (ties to Risks R2 and Monetization §5).

---

## Dependency Graph (summary)

```
S0 Foundation
  └─▶ S1 Auth
        └─▶ S2 Data + RLS + CRUD
              ├─▶ S3 Realtime ──▶ S4 Reconciliation
              └─▶ S5 Projects + Search
                        └─▶ S6 Devices/Settings/Hardening ──▶ [MVP]
                                    └─▶ S7 Sharing/Notifications (v1.1)
                                          └─▶ S8 Collections/Analytics (v2)
                                                └─▶ S9 Extension (v2)
                                                      └─▶ S10+ Teams/Platform (v3)
```

---

*End of Development Roadmap.*
