# DevSync — MVP Definition

**Version:** 1.0
**Last updated:** 2026-07-22

This document draws the precise boundary of the MVP using the **MoSCoW** method (Must / Should / Could / Won't). Every item includes the reasoning for its placement. The MVP has one job: **prove that instant, trustworthy, cross-device sync of developer text is valuable and reliable — at $0 operating cost.**

A feature is only "Must Have" if the core hypothesis **cannot be tested without it**.

---

## Must Have (the MVP cannot ship without these)

| # | Feature | Why it is a Must |
|---|---------|------------------|
| M1 | GitHub + Google OAuth sign-in | There is no per-user, secure sync without identity. Developer-native, avoids password management (and its risks). |
| M2 | Device registration + device list + revoke | Sync is defined as "between a user's devices." Devices must be a real concept, and users must be able to cut off access (minimum trust bar). |
| M3 | Create a snippet (text + optional title/type/project) | The entry point of all value. Without capture there is nothing to sync. |
| M4 | View snippet stream (reverse-chronological) | Users must see what they have. The home surface of the product. |
| M5 | One-click **Copy** to clipboard | This is the hero action — the payoff of the whole loop (copy on B, paste into the AI assistant). |
| M6 | Delete a snippet (propagating) | Data control is a trust requirement; users must be able to remove sensitive content everywhere. |
| M7 | Edit snippet metadata (title/type/project) | Basic correction and organization; low cost, high everyday utility. |
| M8 | Near-real-time sync of create/update/delete | **This is the product.** The entire hypothesis rests on this working reliably. |
| M9 | Offline reconciliation on reconnect | Without it, sync silently loses data and destroys trust. Non-negotiable for a sync product. |
| M10 | Projects incl. default **Inbox** | Freelancers must not mix clients; everyone benefits from light separation. Inbox guarantees zero-setup productivity. Cheap, high payoff. |
| M11 | History + full-text search + basic filters | The instant a snippet scrolls away, users need to find it. Turns a pipe into a memory — a core early differentiator, low cost on Postgres. |
| M12 | Row-Level Security + TLS | Content is sensitive. Isolation must be at the data layer from line one, or trust is impossible to earn back. |
| M13 | Responsive web app | Web-first removes install friction (critical for locked-down/lab machines) and reaches all OSes instantly. |
| M14 | Sync-status + offline/error states | Trust depends on the user always knowing whether sync is working. Cheap, essential. |
| M15 | Product instrumentation (activation/engagement/reliability metrics) | We cannot judge MVP success (PRD §17) without measuring it. Internal-only at MVP. |

**Reasoning summary:** M1–M15 are the smallest set that lets a real user experience — and lets us measure — the complete loop: *sign in → capture on one device → it appears instantly and reliably on another → copy it → paste into the AI assistant → find it later.* Remove any one and either the loop breaks or trust collapses.

---

## Should Have (valuable, targeted for the MVP window if time allows; otherwise v1.1)

| # | Feature | Why "Should," not "Must" |
|---|---------|--------------------------|
| S1 | Snippet type badges + suggested type | Improves scannability but the loop works without it. Nice polish; not load-bearing. |
| S2 | Keyboard shortcuts for create/copy/search | Big delight for power users, but the loop is usable with mouse. Include if cheap. |
| S3 | Dark/light theme | Expected by developers; low effort with the chosen component system. Should-have polish. |
| S4 | Thoughtful empty states + first-run onboarding | Improves activation (a Must to *measure*, a Should to *optimize* within the window). |
| S5 | Move snippet between projects | Natural once projects exist; low cost. Not required to prove the loop. |

**Reasoning:** These materially improve activation and satisfaction but are not prerequisites for testing the hypothesis. They are the first things to pull forward if MVP engineering finishes early, and the first things to cut if it runs late.

---

## Could Have / Nice to Have (explicitly v1.1+, not MVP)

| # | Feature | Why deferred |
|---|---------|--------------|
| C1 | Share links (read-only, expiring) | Widens the trust/security surface (external access). Only worth building once the private loop is proven. Targeted for v1.1. |
| C2 | In-app arrival notifications | Closes the perceptual loop, but the highlight animation on receive suffices at MVP. v1.1. |
| C3 | Pin/favorite snippets | Retention booster, not core. v1.1. |
| C4 | Auto type-detection (heuristic) | Convenience; user-selected type is enough at MVP. v1.1. |
| C5 | Data export | Good trust signal; deletion covers the essential control at MVP. v1.1/v2. |

---

## Won't Have (out of scope — and why)

| # | Feature | Why out of scope for MVP |
|---|---------|--------------------------|
| W1 | Team workspaces / sharing collections | Multiplies complexity (permissions, invites, billing, abuse). Must ride on proven individual value. → v3. |
| W2 | Browser extension | Separate distribution + store review overhead; premature before web PMF. → v2. |
| W3 | Native mobile/desktop apps | Web-first proves the hypothesis; native is a reach/friction optimization. → v3+. |
| W4 | AI enrichment (summarize/suggest fixes) | Has real cost and must not distract from pipe reliability. Needs a corpus first. → long term. |
| W5 | File / image / binary sync | Text is the dominant payload and proves the value; binary adds storage cost and complexity. → future. |
| W6 | Public API / webhooks | Requires a settled, versioned data contract. → v3. |
| W7 | Collections (cross-project) | No corpus to organize yet at MVP. → v2. |
| W8 | Personal analytics dashboard | Needs accumulated data; internal metrics suffice at MVP. → v2. |
| W9 | Billing / paid plans | Monetize only after habitual value is proven; MVP is free-tier by mandate. → v3. |
| W10 | Self-hosting / on-prem | Cloud SaaS proves the model; on-prem is an enterprise concern. → long term. |

---

## The MVP Acceptance Bar (definition of "done")

The MVP is complete when, on real mixed hardware (Windows/macOS/Linux, multiple browsers):

1. A user can sign in with GitHub or Google and land in the app in under 3 minutes.
2. A snippet created on one device appears on another authenticated device in ~1 second, reliably, over multiple sessions.
3. Copy-to-clipboard works in one action on every snippet.
4. Going offline and back online never loses or duplicates a snippet.
5. Deleting a snippet removes it everywhere.
6. A user can find any past snippet via search in seconds.
7. Projects (incl. Inbox) correctly scope snippets; no client-context leakage.
8. A user can see and revoke devices; a revoked device loses access immediately.
9. RLS provably prevents any user from reading another user's data.
10. The whole system runs within free-tier limits at $0.

Only when all ten hold do we proceed to private beta (PRD §18).

---

## Scope-Control Rules (to prevent MVP creep)

1. **No feature enters the MVP unless it fails the "cannot test the hypothesis without it" bar.**
2. **Trust and reliability items are never cut** (M9, M12, M14 are as sacred as the sync itself).
3. **Polish (Should/Could) is the flex budget,** pulled forward or dropped based on schedule — never at the expense of Must items.
4. **Every "just one more thing" request is filed against v1.1+,** not the MVP, unless it fixes a broken Must.

---

*End of MVP Definition.*
