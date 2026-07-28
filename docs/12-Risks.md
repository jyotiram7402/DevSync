# DevSync — Risk Register & Mitigation

**Version:** 1.0
**Last updated:** 2026-07-22

This document catalogs risks across five categories, rates each by **Likelihood** and **Impact**, and defines a **Mitigation Strategy**. Ratings are Low / Medium / High. The register should be revisited at each phase boundary (alpha → beta → public → v1.1+).

**Risk scoring key:** *Impact × Likelihood* → priority. High-impact risks are addressed architecturally from day one even when likelihood is low.

---

## 1. Technical Risks

### T1 — Realtime reconnection / reconciliation edge cases cause perceived data loss
- **Likelihood:** Medium · **Impact:** High
- **Why it matters:** A sync product that occasionally "loses" a snippet loses user trust permanently. This is the single most important technical risk.
- **Mitigation:**
  - Architect **persist-then-broadcast** and **reconcile-against-source-of-truth-on-reconnect** from the start (Data Flow §2, §4).
  - Make change application **idempotent** to prevent duplicates on redelivery.
  - Dedicate an entire sprint (Sprint 4) to reconciliation and reliability with exhaustive scenario reasoning.
  - Always show sync state so a gap is visible, never silent.

### T2 — No local build/run environment → build failures only surface on Vercel
- **Likelihood:** High (early) · **Impact:** Medium
- **Why it matters:** The corporate machine cannot build locally; errors are discovered only on Vercel, slowing iteration.
- **Mitigation:**
  - **De-risk in Sprint 0** by proving the full pipeline before feature work.
  - Enforce a **static, build-clean-first discipline**: strong typing, conservative dependency choices, careful reasoning about imports/SSR/edge constraints before merge.
  - Budget explicit "fix-from-Vercel-logs" cycles in early sprints.
  - Keep changes small and reversible so a failed build is easy to diagnose.

### T3 — Framework/SSR/edge runtime pitfalls (hydration, server/client boundaries)
- **Likelihood:** Medium · **Impact:** Medium
- **Mitigation:** Clear separation of server vs. client responsibilities; keep realtime/client-only logic on the client; validate against Vercel's runtime early (Sprint 0/1).

### T4 — Clipboard API restrictions across browsers
- **Likelihood:** Medium · **Impact:** Low–Medium
- **Why it matters:** The "copy" action is the hero; browser clipboard permissions vary.
- **Mitigation:** Use the standard clipboard capability with a graceful fallback (select-all + explicit copy) when permission is denied; test across major browsers.

---

## 2. Security Risks

### S1 — Exposure of sensitive snippet content (secrets, tokens, proprietary code) — **existential**
- **Likelihood:** Low (if done right) · **Impact:** Very High
- **Why it matters:** Users paste secrets. A single cross-user leak or breach would be fatal to the product's trust.
- **Mitigation:**
  - **Row-Level Security at the database layer** (not just app code) so isolation holds even if the client is compromised (Sprint 2, security-reviewed).
  - TLS everywhere; no sensitive data in URLs/query strings.
  - **No password handling** — delegate to OAuth providers, eliminating a whole risk class.
  - Realtime channels strictly per-user; verify no cross-user event delivery.
  - Sensitive-by-default posture; explicit, propagating deletion.
  - Security review gate on every data-touching sprint (2, 3, 4, 7).

### S2 — Share links leak content (v1.1)
- **Likelihood:** Medium · **Impact:** High
- **Mitigation:** Unguessable tokens; **mandatory expiry**; one-click revocation; read-only, single-snippet scope; the public route exposes nothing beyond that one snippet; expired/invalid links show no content.

### S3 — OAuth misconfiguration (redirect/callback, token handling)
- **Likelihood:** Medium · **Impact:** High
- **Mitigation:** Rely on the managed auth provider's flows; verify redirect URIs and session handling in Sprint 1; security-review the auth surface before beta.

### S4 — Abuse / spam / malicious content via share links or (future) API
- **Likelihood:** Medium · **Impact:** Medium
- **Mitigation:** Rate limiting; content size limits; abuse reporting on public share pages; monitor and revoke; expand controls with API launch (v3).

---

## 3. Scalability Risks

### SC1 — Free-tier limits (DB rows/storage, realtime connections/messages) cap growth
- **Likelihood:** Medium–High (with success) · **Impact:** Medium
- **Why it matters:** The MVP mandate is $0, but success could hit Supabase/Vercel free-tier ceilings.
- **Mitigation:**
  - **Monitor usage against limits from beta onward** (explicit practice in the Dev Roadmap).
  - Architecture is **tier-upgrade-ready** (same services, higher plans) — no redesign needed.
  - Have a **Pro paid tier ready to launch** before limits are threatened (ties to Monetization §5), so revenue funds the higher tier exactly when needed.
  - Retention policies on free tier (recent history) to bound storage growth.

### SC2 — Realtime fan-out cost at scale (many devices per user, many users)
- **Likelihood:** Medium · **Impact:** Medium
- **Mitigation:** Per-user channel scoping keeps fan-out bounded to a user's own devices; batch rapid successive events; monitor connection counts; move to higher realtime tiers as needed.

### SC3 — Large individual histories degrade search/list performance
- **Likelihood:** Medium · **Impact:** Low–Medium
- **Mitigation:** Server-side full-text indexing, pagination, and list virtualization from Sprint 5; retention limits on free tier.

---

## 4. Business Risks

### B1 — Low willingness to pay for "clipboard sync"
- **Likelihood:** High · **Impact:** High
- **Why it matters:** People don't pay much for sync alone.
- **Mitigation:** **Monetize the workspace/collaboration/intelligence layers, not the core loop** (Monetization philosophy). Keep sync free as the growth wedge; charge for depth, teams, and AI.

### B2 — Platform bundling (Apple/Microsoft/GitHub ship equivalent sync)
- **Likelihood:** Medium · **Impact:** High
- **Mitigation:** Own the niche incumbents won't serve — **cross-OS + developer-aware + install-free + workspace features**. Move up-stack (organized searchable dev corpus, AI enrichment, teams) faster than a generic OS feature can.

### B3 — Weak activation/retention (users try once, don't form a habit)
- **Likelihood:** Medium · **Impact:** High
- **Mitigation:** Obsess over **time-to-first-sync (<3 min)** and second-device activation; instrument from Sprint 6; iterate onboarding in v1.1 using real data; the North Star metric (weekly synced snippets/active user) keeps focus on habit, not sign-ups.

### B4 — Crowded/generic name hurts discoverability and trademark ("DevSync")
- **Likelihood:** Medium · **Impact:** Medium
- **Mitigation:** Availability/trademark check now; hold ownable fallbacks; decide final name at the Phase-1→Phase-2 boundary before public launch (Naming Review §4).

---

## 5. Operational Risks

### O1 — Dependence on managed free tiers → limited control during provider incidents
- **Likelihood:** Medium · **Impact:** Medium
- **Mitigation:** Inherit reputable providers' SLAs; transparent status communication to users during incidents; ensure the app degrades gracefully (clear offline/reconnecting states) rather than failing opaquely.

### O2 — Vendor lock-in (Supabase/Vercel)
- **Likelihood:** Medium · **Impact:** Medium
- **Mitigation:** Postgres is a portable, open core (reduces DB lock-in); keep data-access and realtime concerns behind clear internal boundaries so a future migration is contained; accept pragmatic lock-in at MVP in exchange for speed and $0 cost, with eyes open.

### O3 — Small team / key-person and support load
- **Likelihood:** Medium · **Impact:** Medium
- **Mitigation:** Documentation-first culture (this blueprint); simple, well-bounded architecture; feature flags and small releases to keep operational load low; community support tier before paid support scales.

### O4 — Data-deletion / privacy compliance failures
- **Likelihood:** Low · **Impact:** High
- **Mitigation:** Deletion honored end-to-end (all devices + source of truth) as a tested guarantee; clear privacy policy; account deletion removes all associated data; treat this as a trust cornerstone, not a checkbox.

---

## 6. Risk Priority Summary

| ID | Risk | Category | L | I | Priority |
|----|------|----------|---|---|----------|
| S1 | Cross-user content exposure | Security | Low | Very High | **P0 (architectural)** |
| T1 | Reconciliation data loss | Technical | Med | High | **P0** |
| B1 | Low willingness to pay for sync | Business | High | High | **P1** |
| B3 | Weak activation/retention | Business | Med | High | **P1** |
| B2 | Platform bundling | Business | Med | High | **P1** |
| S2 | Share-link leakage | Security | Med | High | **P1** |
| SC1 | Free-tier ceilings | Scalability | Med–High | Med | **P1** |
| T2 | Build-only-on-Vercel friction | Technical | High | Med | **P2** |
| S3 | OAuth misconfig | Security | Med | High | **P2** |
| O1 | Provider incident dependence | Operational | Med | Med | **P2** |
| Others | (T3,T4,S4,SC2,SC3,B4,O2,O3,O4) | — | — | — | P2–P3 |

**Reading:** P0 risks are addressed in the architecture from day one (RLS, persist-then-broadcast). P1 risks drive product and go-to-market decisions (monetization thesis, activation focus, differentiation, free-tier watch). P2/P3 are managed through engineering discipline and monitoring.

---

## 7. Overarching Mitigation Themes

1. **Security and reliability are architectural, not bolted on** — they live in the data layer and the sync design from Sprint 0.
2. **The business model routes around the "sync is cheap" risk** by monetizing higher-value layers.
3. **The $0 mandate is protected by a tier-upgrade-ready design and a ready-to-launch paid tier.**
4. **The build-environment constraint is de-risked first** (Sprint 0) and managed by static discipline throughout.
5. **Trust is treated as the product's core asset** — every privacy/security/deletion guarantee is a feature, not a formality.

---

*End of Risk Register.*
