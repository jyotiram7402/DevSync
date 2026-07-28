# DevSync — Product Requirements Document (PRD)

**Version:** 1.0
**Status:** Draft for engineering handoff
**Owners:** Product Management, Architecture
**Last updated:** 2026-07-22

---

## 1. Executive Summary

DevSync is a SaaS platform that instantly synchronizes text artifacts — error messages, stack traces, logs, code snippets, and commands — across a developer's authenticated devices. It is purpose-built for the modern reality that developers work across more than one machine and increasingly rely on AI coding assistants (Claude, ChatGPT, Gemini) that may live on a different device than the one producing the error.

Today the workflow is manual and repetitive: a developer hits an error on Machine A, copies it, and physically ferries it to Machine B (via email to self, chat message, a note app, or a USB flow) where the AI assistant or a second IDE lives. DevSync collapses that loop into a single action: **copy once on one device, and it appears everywhere else in real time.**

The MVP is intentionally narrow and achievable entirely on free-tier infrastructure (Vercel + Supabase + GitHub OAuth/Google OAuth). The long-term ambition is far larger: DevSync becomes a **developer productivity workspace** — a persistent, searchable, organized, shareable memory of everything a developer copies while building software.

This PRD defines the problem, the users, the requirements, the MVP boundary, and the metrics by which success is judged.

---

## 2. Problem Statement

### 2.1 The core problem

Developers routinely need to move small pieces of text between machines and contexts. The most acute case is **debugging with AI assistants**:

1. A project (Java, Spring Boot, Python, Node.js, Docker, etc.) throws an error on the primary development machine.
2. The developer selects and copies the error/stack trace.
3. The AI assistant (Claude Code, ChatGPT, Gemini) or a second workstation is on a **different machine** — a personal laptop, a second monitor rig, a locked-down work device, or a phone.
4. The developer manually transfers the text: emails it to themselves, pastes it into a chat, drops it in a notes app, or types it out.
5. They repeat this **dozens of times a day**.

Each transfer is small, but the aggregate cost is significant: context-switching, lost focus, transcription errors, and friction that discourages using the better tool.

### 2.2 Why existing solutions fall short

- **OS clipboard sync** (Apple Universal Clipboard, Windows Cloud Clipboard) is locked to a single OS ecosystem, is not developer-aware, keeps no searchable history, and does not cross OS boundaries (which is exactly the mixed-fleet reality of developers).
- **Chat-to-self / email-to-self** works but is noisy, unsearchable in a structured way, and pollutes communication tools.
- **Clipboard managers** (CopyQ, Paste, ClipboardFusion) are local-first and often single-device; cross-device sync is weak, paid, or ecosystem-locked.
- **GitHub Gist / Pastebin** is built for sharing, not for a private, instantaneous, per-device sync stream. It requires manual creation and manual retrieval.

None of these were designed for the **developer, multi-device, AI-assisted debugging loop**. That is the gap DevSync fills.

### 2.3 Problem severity

- **Frequency:** Multiple times per hour during active debugging.
- **Breadth:** Any developer using more than one device or an AI assistant — a rapidly growing majority.
- **Emotional cost:** Friction during debugging is felt most acutely precisely when the developer is already frustrated.

---

## 3. Vision

> To become the connective tissue of a developer's multi-device life — the place where everything you copy while building software is instantly available, permanently organized, effortlessly searchable, and safely shareable.

DevSync starts as "clipboard sync for developers" and grows into a **developer productivity workspace**: a personal knowledge layer that sits beside the IDE and the AI assistant, capturing the ephemeral text that developers currently throw away.

---

## 4. Mission

> Eliminate the friction of moving text between the machines and tools developers use, so they can stay in flow.

Every feature decision is measured against a single question: *does this reduce the time and effort between "I have this text here" and "I have this text where I need it"?*

---

## 5. Objectives

1. **Prove the core loop.** Deliver instant, reliable, secure sync of text snippets across a user's authenticated devices.
2. **Zero-cost operation at MVP.** Operate the MVP entirely within free tiers to validate demand before incurring cost.
3. **Trustworthy by design.** Establish security and privacy as first-class, because users will paste sensitive material.
4. **Foundation for scale.** Build an architecture that supports thousands of users and a future paid tier without redesign.
5. **Delightful primitives.** Make the atomic actions (copy, sync, search, receive) feel instantaneous and obvious.

---

## 6. Goals

| Goal | Description | Measured by |
|------|-------------|-------------|
| G1 | A snippet created on one device appears on another authenticated device in under ~1 second (perceived instant). | Median sync latency |
| G2 | A user can find any past snippet in seconds. | Search success rate / time-to-find |
| G3 | Onboarding to first successful sync takes under 3 minutes. | Time-to-first-sync |
| G4 | Users trust DevSync with sensitive text. | Retention, qualitative trust surveys |
| G5 | The MVP costs $0 to operate at launch. | Infrastructure spend |

---

## 7. Non-Goals

Explicitly out of scope for the foreseeable roadmap (not just MVP), to keep the product focused:

1. **Not a full clipboard manager for arbitrary binary content** (images, files, rich media) at MVP. Text-first.
2. **Not a real-time collaborative code editor** (no Google-Docs-style multiplayer editing). DevSync moves discrete artifacts, it is not a live document surface.
3. **Not an AI assistant itself.** DevSync feeds AI assistants; it does not replace them. (AI *enrichment* features are a later, additive layer — see Future Vision.)
4. **Not a general-purpose note-taking app.** It is anchored to the developer copy/debug workflow.
5. **Not a secrets manager / vault** replacement (though it must handle secrets responsibly). It will never position itself as the system of record for credentials.
6. **Not an on-premise / self-hosted product** at MVP. Cloud SaaS only.

---

## 8. User Personas

### Persona 1 — "Multi-Machine Maya" (Primary)
- **Role:** Full-stack developer at a mid-size company.
- **Setup:** Work laptop (locked down), personal desktop, sometimes a tablet.
- **Behavior:** Runs the app on the work laptop, uses a personal machine for an AI assistant because the work device blocks it.
- **Pain:** Constantly emailing errors to herself. Loses track of which email had which trace.
- **Need:** Instant, private sync between her machines with a searchable history.

### Persona 2 — "Student Sam"
- **Role:** CS student learning to code.
- **Setup:** Lab desktop + personal laptop + phone.
- **Behavior:** Heavy AI-assistant user for learning; frequently moves errors and homework snippets around.
- **Pain:** Lab machines are shared and restricted; can't install clipboard tools.
- **Need:** A browser-based, install-free, free way to move snippets and keep a study history.

### Persona 3 — "Freelancer Farah"
- **Role:** Independent contractor juggling multiple client projects.
- **Setup:** One primary machine, one backup, occasionally a client-provided VM.
- **Behavior:** Needs to keep snippets separated per client/project and occasionally share a snippet with a client.
- **Pain:** Mixing client contexts is a professional risk; sharing via email is clumsy.
- **Need:** Project-scoped organization and clean, expiring share links.

### Persona 4 — "AI-Native Alex"
- **Role:** Developer whose primary workflow is prompt-driven.
- **Setup:** IDE machine + a second "AI machine."
- **Behavior:** The copy→AI loop is their inner loop, executed constantly.
- **Need:** The fastest possible path from "error here" to "prompt there," ideally with keyboard-only flow.

### Persona 5 — "Team Lead Tariq" (Future)
- **Role:** Engineering lead at a startup.
- **Setup:** Wants his team to share common error patterns and fixes.
- **Need:** Shared collections, team workspaces, permissions. (Post-MVP; informs architecture now.)

---

## 9. User Stories

Format: *As a [persona], I want [capability], so that [benefit].*

### Authentication & Devices
- As a developer, I want to sign in with GitHub or Google, so that I don't manage another password.
- As a developer, I want to see all devices connected to my account, so that I can trust what has access.
- As a developer, I want to revoke a device, so that a lost or old machine loses access immediately.

### Core Sync
- As a developer, I want a snippet I create on one device to appear on my other devices instantly, so that I can debug on whichever machine has my AI assistant.
- As a developer, I want to copy a synced snippet to my clipboard with one click, so that I can paste it into my assistant immediately.
- As a developer, I want sync to work across operating systems (Windows, macOS, Linux), so that my mixed fleet is not a barrier.

### Organization
- As a freelancer, I want to organize snippets into projects, so that client contexts never mix.
- As a developer, I want to tag or label snippets, so that I can group related errors.
- As a developer, I want snippets to record their source (language/type), so that I can scan history quickly.

### History & Search
- As a developer, I want a searchable history of everything I've synced, so that I can recover a trace I saw last week.
- As a developer, I want to filter by project, type, and date, so that I can narrow down quickly.

### Sharing
- As a freelancer, I want to generate a shareable link to a snippet, so that I can send a fix to a client.
- As a developer, I want share links to expire, so that sensitive text doesn't live forever.

### Trust & Control
- As a developer, I want to delete a snippet everywhere, so that I control my data.
- As a developer, I want assurance that my data is private, so that I trust the product with sensitive text.

---

## 10. Functional Requirements

> Numbered for traceability. `[MVP]` marks MVP-scope; `[POST]` marks post-MVP.

### FR-1 Authentication
- FR-1.1 `[MVP]` Users authenticate via GitHub OAuth.
- FR-1.2 `[MVP]` Users authenticate via Google OAuth.
- FR-1.3 `[MVP]` A user's identity is unified across providers by verified email where possible.
- FR-1.4 `[MVP]` Sessions persist securely and can be signed out.

### FR-2 Device Management
- FR-2.1 `[MVP]` On first authenticated use, a device is registered to the account with a friendly, editable name.
- FR-2.2 `[MVP]` Users can view all registered devices with last-active time.
- FR-2.3 `[MVP]` Users can revoke/remove a device.

### FR-3 Snippet Lifecycle
- FR-3.1 `[MVP]` Users can create a snippet by pasting/typing text.
- FR-3.2 `[MVP]` A snippet stores content, optional title, detected/selected type (e.g., error, log, code, command, plain text), source device, and timestamps.
- FR-3.3 `[MVP]` Users can copy a snippet's content to the local clipboard in one action.
- FR-3.4 `[MVP]` Users can edit a snippet's metadata (title, type, project).
- FR-3.5 `[MVP]` Users can delete a snippet; deletion propagates to all devices.

### FR-4 Realtime Sync
- FR-4.1 `[MVP]` A newly created or updated snippet propagates to all of the user's active devices in near-real-time.
- FR-4.2 `[MVP]` Deletions propagate in near-real-time.
- FR-4.3 `[MVP]` A device that was offline reconciles state on reconnect (no lost snippets).
- FR-4.4 `[MVP]` Sync is scoped strictly to the authenticated user's own data.

### FR-5 Projects
- FR-5.1 `[MVP]` Users can create projects and assign snippets to a project.
- FR-5.2 `[MVP]` A default/inbox project exists so users can be productive without setup.
- FR-5.3 `[POST]` Projects can carry settings (default type, retention policy).

### FR-6 Search & History
- FR-6.1 `[MVP]` Users can view a chronological history of their snippets.
- FR-6.2 `[MVP]` Users can full-text search snippet content and titles.
- FR-6.3 `[MVP]` Users can filter by project, type, and date range.

### FR-7 Sharing
- FR-7.1 `[POST-MVP / v1.1]` Users can generate a read-only share link for a snippet.
- FR-7.2 `[POST]` Share links can expire and be revoked.

### FR-8 Collections (Grouping beyond projects)
- FR-8.1 `[POST / v2]` Users can group snippets into named collections independent of project.

### FR-9 Notifications
- FR-9.1 `[POST / v1.1]` In-app indication when a new snippet arrives from another device.
- FR-9.2 `[POST / v2]` Optional push/browser notifications.

### FR-10 Analytics (User-facing)
- FR-10.1 `[POST / v2]` Users can see personal usage stats (snippets synced, most-used types).

---

## 11. Non-Functional Requirements

### NFR-1 Performance
- Median perceived sync latency **< 1 second** device-to-device under normal network conditions.
- Initial app load (authenticated) **< 3 seconds** on a typical broadband connection.

### NFR-2 Reliability
- No silent data loss. A created snippet is durably stored before it is acknowledged.
- Offline devices reconcile without duplication or loss on reconnect.

### NFR-3 Security
- All traffic over TLS.
- Data isolation enforced at the database layer (row-level security), not merely in application code.
- OAuth tokens and sessions handled by the managed auth provider; no custom password storage.
- Principle of least privilege for all data access.
- Sensitive-by-default posture: treat all snippet content as potentially secret.

### NFR-4 Privacy
- A user's snippets are visible only to that user (and explicitly shared recipients).
- Clear data-deletion path; deletion is honored across all replicas/devices.
- No selling or third-party sharing of user content.

### NFR-5 Scalability
- Architecture supports thousands of concurrent users on the chosen managed services, with a clear, documented path to paid tiers for growth beyond free-tier limits.

### NFR-6 Availability
- Target 99.5%+ effective availability at MVP (inheriting the SLAs of Vercel and Supabase). No custom infrastructure that would lower this.

### NFR-7 Usability & Accessibility
- Keyboard-first core loop (create, copy, search).
- WCAG AA color contrast and focus states via the chosen component system.
- Responsive: usable on desktop and mobile web.

### NFR-8 Maintainability
- Strong typing end-to-end (TypeScript).
- Clear separation between data access, realtime, and presentation layers.

### NFR-9 Cost
- MVP operates at **$0** recurring cost within documented free-tier limits.

---

## 12. MVP Scope

The MVP delivers the **core loop end-to-end**:

**In scope:**
- GitHub + Google OAuth sign-in.
- Device registration and a basic device list with revoke.
- Create, view, copy, edit-metadata, and delete text snippets.
- Projects (including a default inbox) to organize snippets.
- Near-real-time sync of create/update/delete across the user's devices.
- Chronological history with full-text search and basic filters.
- Responsive web app (desktop + mobile web).
- Security: row-level data isolation, TLS, managed auth.

**Explicitly deferred from MVP** (see MVP Definition doc for full reasoning): sharing links, collections, notifications, analytics, teams, browser extension, desktop/native clients, AI enrichment, file/image support.

Rationale: the MVP must prove that *instant, trustworthy sync of developer text across devices* is valuable and reliable. Everything else is additive and can wait until that hypothesis is validated.

---

## 13. Future Scope

Ordered roughly by roadmap phase (see Product Roadmap for detail):

- **v1.1:** Share links (expiring, revocable); arrival notifications; snippet pinning/favorites.
- **v2:** Collections; browser extension for one-keystroke capture; user analytics; richer type detection; snippet templates.
- **v3:** Team workspaces, shared collections, roles/permissions; native/desktop helper for global clipboard capture; API + webhooks.
- **Long term:** AI enrichment (auto-summarize errors, suggest fixes), marketplace of integrations, enterprise SSO/audit, developer ecosystem.

---

## 14. Constraints

### 14.1 Development environment constraints
- Development occurs on a **restricted corporate machine**: no local execution of npm/node/next/docker/git/CLIs and no local build/run. All builds occur on **Vercel** via a **GitHub → Vercel** pipeline. Consequently, **every file must be production-ready on first build**, since Vercel is the first environment where code is ever compiled. This is a hard operational constraint that shapes how code will later be authored and reviewed (statically, not by running it locally).

### 14.2 Cost constraints
- MVP must run entirely on free tiers: Vercel (hosting/CI), Supabase (Postgres, auth, realtime), GitHub/Google (OAuth). No paid dependency may be introduced for MVP.

### 14.3 Technology constraints
- Frontend: Next.js + React + TypeScript + Tailwind + shadcn/ui.
- Backend/DB/Realtime/Auth: Supabase (PostgreSQL + Realtime + Auth).
- Only free-tier technologies unless there is no reasonable alternative.

### 14.4 Platform constraints
- MVP is **web-first**. Native mobile and desktop clients are out of MVP scope but the architecture must not preclude them.

---

## 15. Risks

Summarized here; full treatment in [Risks](12-Risks.md).

| Risk | Category | Severity | Summary |
|------|----------|----------|---------|
| R1 | Security | High | Users paste secrets; a breach or leak is existential for trust. |
| R2 | Scalability | Medium | Free-tier Realtime connection/row limits could cap growth. |
| R3 | Technical | Medium | Realtime reconnection/reconciliation edge cases cause perceived data loss. |
| R4 | Business | High | Low willingness to pay for "clipboard sync"; monetization must ride the broader workspace value. |
| R5 | Business | Medium | Big platforms (Apple/Microsoft/GitHub) could bundle equivalent functionality. |
| R6 | Operational | Medium | Reliance on managed free tiers means limited control during provider incidents. |

---

## 16. Assumptions

1. The target users already work across multiple devices and/or use AI assistants (validated by market trends).
2. Users will accept OAuth-only sign-in (no email/password) — acceptable for a developer audience.
3. Free-tier limits of Supabase and Vercel are sufficient for an early user base (to be monitored; see Risks).
4. Text is the dominant payload; binary/file sync is not required to prove value.
5. Near-real-time (sub-second, best-effort) is sufficient; hard real-time guarantees are not required.
6. Users trust a reputable managed stack (Supabase/Vercel) more than a self-hosted unknown.

---

## 17. Success Metrics

### 17.1 North Star Metric
**Weekly Synced Snippets per Active User** — captures whether the core loop is genuinely part of users' workflow (not just sign-ups).

### 17.2 Supporting metrics

**Activation**
- Time-to-first-sync (target: < 3 min from sign-up).
- % of new users who connect a second device within 7 days (target: > 40%).

**Engagement**
- Weekly active users (WAU) / Monthly active users (MAU) ratio (target: > 0.4 — indicates habitual use).
- Median snippets synced per active user per week.

**Retention**
- Week-4 retention (target: > 25% for a dev tool at MVP).

**Reliability (product health)**
- Median sync latency (target: < 1s).
- Sync error rate (target: < 0.5% of sync events).

**Trust**
- Data-deletion requests fulfilled correctly: 100%.
- Zero security incidents involving user content.

**Cost**
- Infrastructure spend at MVP: $0.

---

## 18. Release Strategy

### Phase 0 — Internal alpha (dogfood)
- Team members use DevSync across their own devices.
- Goal: validate the core loop, latency, and reconciliation on real mixed hardware.
- Exit criteria: core loop reliable for two weeks with no data-loss incidents.

### Phase 1 — Private beta (invite-only)
- Small cohort of target users (students, individual devs, freelancers) via waitlist/invites.
- Goal: validate activation and retention metrics; gather qualitative trust feedback.
- Free-tier usage monitored against limits.
- Exit criteria: activation and W4 retention targets trending toward goal; no critical security issues.

### Phase 2 — Public MVP launch
- Open sign-up.
- Positioned around the sharp wedge: *"Copy Once. Debug Anywhere."*
- Launch surfaces: developer communities (Hacker News, Reddit r/programming, dev.to), Product Hunt, relevant Discords.
- Monitor free-tier headroom; prepare paid-tier plan before limits are threatened.

### Phase 3 — v1.1 and beyond
- Ship sharing + notifications based on demand signals.
- Introduce first monetization experiments only after the free product has proven habitual value (see Monetization doc).

### Release cadence
- Continuous deployment via GitHub → Vercel. Small, frequent, reversible releases. Feature flags for anything risky.

---

*End of PRD.*
