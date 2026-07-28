# 16 — Architecture Risks & Mitigation

**Version:** 1.0 · **Last updated:** 2026-07-22

This document catalogs **technical/architecture-level** risks (distinct from the product/business risk register in the [product blueprint](../12-Risks.md)) across five dimensions: architecture, performance, security, maintenance, and scaling. Each risk has a Likelihood × Impact rating (Low/Medium/High) and a concrete mitigation grounded in the decisions of documents 01–15.

**Rating lens:** High-impact risks are mitigated *architecturally* (built into the design), even when likelihood is low.

---

## 1. Architecture Risks

### A1 — Vendor lock-in to Supabase
- **L:** Medium · **I:** Medium
- **Risk:** Deep coupling to Supabase (DB + auth + realtime + storage) makes a future migration costly.
- **Mitigation:**
  - **`services/` data-access seam** ([02](02-Folder-Structure.md)) isolates all Supabase calls in one layer — a migration is contained there, not spread across features.
  - **PostgreSQL is portable** open-source at the core; data can move.
  - The **client contract and data model are provider-agnostic** ([15](15-Scalability-Plan.md) §7).
  - Accepted deliberately at MVP for the enormous free-tier/velocity benefit, with eyes open.

### A2 — No-local-build constraint → defects surface only on Vercel
- **L:** High (early) · **I:** Medium
- **Risk:** Build/runtime errors are discovered only after push, slowing iteration and risking broken deploys.
- **Mitigation:**
  - **De-risk the pipeline first** (Sprint 0 of the dev roadmap): prove a clean Vercel build before feature work.
  - **Static-first coding standards** ([12](12-Coding-Standards.md)): strict TS, explicit return types, exhaustive unions, no hidden throws, disciplined server/client boundaries.
  - **Vercel preview builds are a required merge gate** ([13](13-Git-Strategy.md)) — nothing merges that hasn't compiled on Vercel.
  - **Small, squash-merged PRs** make first-build failures easy to localize from logs.
  - Conservative, version-aligned dependencies (Next 15 / React 19).

### A3 — Server/Client component boundary violations
- **L:** Medium · **I:** Medium
- **Risk:** The most common Next.js App Router build failures (client-only APIs in server code and vice versa; leaking secrets into client bundles).
- **Mitigation:** Explicit boundary discipline ([03](03-Component-Architecture.md)); the `lib/` split of browser/server/middleware Supabase clients ([02](02-Folder-Structure.md)); `NEXT_PUBLIC_` prefix policy ([14](14-Environment-Variables.md)); boundary correctness is a review checklist item ([13](13-Git-Strategy.md)).

### A4 — Over-reliance on Zustand for server state
- **L:** Low–Medium · **I:** Medium
- **Risk:** Treating the client store as authoritative for server data causes drift/bugs.
- **Mitigation:** Hard rule — **Postgres is the source of truth; Zustand caches** ([04](04-State-Management.md)); idempotent, id-keyed apply + reconcile-on-reconnect ([07](07-Realtime-Architecture.md)); documented option to adopt a dedicated server-cache library if needs grow — a contained addition, not a redesign.

---

## 2. Performance Risks

### P1 — Heavy client bundle (Monaco Editor) hurts load time
- **L:** Medium · **I:** Medium
- **Risk:** Monaco is large; shipping it on initial load blows the <3s target.
- **Mitigation:** **Dynamic import Monaco only on edit** ([11](11-Performance-Strategy.md)); **Shiki server-side** for read views (zero client highlighter); route/interaction code-splitting; bundle-size watched in review.

### P2 — Large snippet histories degrade list/search
- **L:** Medium · **I:** Medium
- **Risk:** Power users accumulate thousands of snippets; naive lists/queries slow down.
- **Mitigation:** **Cursor pagination + infinite scroll + list virtualization**; owner-leading composite indexes; **GIN full-text index**; preview-only columns in lists ([06](06-Database-Strategy.md), [11](11-Performance-Strategy.md)).

### P3 — Realtime render thrash under event bursts
- **L:** Medium · **I:** Low–Medium
- **Risk:** A burst of changes causes excessive re-renders/toasts.
- **Mitigation:** **Event batching/coalescing**, idempotent apply (drops stale/dupe cheaply), selector-based Zustand subscriptions ([04](04-State-Management.md), [07](07-Realtime-Architecture.md), [11](11-Performance-Strategy.md)).

### P4 — Serverless DB connection exhaustion
- **L:** Medium · **I:** Medium
- **Risk:** Many serverless function invocations open too many DB connections.
- **Mitigation:** **Supabase connection pooler** in front of the DB ([11](11-Performance-Strategy.md), [15](15-Scalability-Plan.md)); reads via replicas at higher stages.

---

## 3. Security Risks

### S1 — Cross-user data exposure (existential)
- **L:** Low (by design) · **I:** Very High
- **Risk:** One user reads another's sensitive content — fatal to trust.
- **Mitigation:** **RLS as the final, data-layer boundary** with default-deny + owner policies ([10](10-Security-Architecture.md)); **realtime respects RLS** ([07](07-Realtime-Architecture.md)); layered authz (middleware → action → services → RLS); RLS-isolation is an explicit **integration test** target ([12](12-Coding-Standards.md)). Two-reviewer rule on RLS changes ([13](13-Git-Strategy.md)).

### S2 — XSS via untrusted snippet content
- **L:** Medium · **I:** High
- **Risk:** Snippet content may contain `<script>`/markup; rendering it unsafely (or on a public share page) could execute it.
- **Mitigation:** **Render content as text, never raw HTML**; **Shiki produces escaped output server-side**; **strict CSP** (no arbitrary inline/external scripts) as the backstop; same rules on the public share page ([10](10-Security-Architecture.md) §9, §11).

### S3 — Secret leakage into the client bundle
- **L:** Low–Medium · **I:** High
- **Risk:** A secret accidentally gets a `NEXT_PUBLIC_` prefix or is imported into client code.
- **Mitigation:** **Prefix-as-policy** + **startup env validation** + review rule (a public-prefixed secret is a blocking defect) ([14](14-Environment-Variables.md)); service-role key used server-only and sparingly ([10](10-Security-Architecture.md) §5).

### S4 — Share-link content leakage (v1.1)
- **L:** Medium · **I:** High
- **Risk:** Public links expose more than intended or outlive their purpose.
- **Mitigation:** **Unguessable tokens + mandatory expiry + revocation + single-snippet read-only**; the public route uses a narrow policy and exposes nothing else; expired/invalid → no content ([10](10-Security-Architecture.md) §4, [07](07-Realtime-Architecture.md)).

### S5 — Abuse/DoS on hot endpoints
- **L:** Medium · **I:** Medium
- **Risk:** Brute force on tokens/auth or spammy creation drains free-tier quotas / availability.
- **Mitigation:** **Rate limiting + size limits** at the action/route boundary; upgradeable to a dedicated limiter at scale ([10](10-Security-Architecture.md) §7, [15](15-Scalability-Plan.md)).

---

## 4. Maintenance Risks

### M1 — Feature tangling / cross-feature coupling over time
- **L:** Medium · **I:** Medium
- **Risk:** Features reach into each other's internals, eroding modularity.
- **Mitigation:** **Feature-first structure + public-surface (`index.ts`) imports only + one-directional dependency rule + no circular deps** ([02](02-Folder-Structure.md), [12](12-Coding-Standards.md)); enforced by lint and review.

### M2 — Type drift between DB, validation, and app
- **L:** Medium · **I:** Medium
- **Risk:** Hand-maintained types diverge from the schema or Zod, causing subtle bugs.
- **Mitigation:** **Generated DB types** + **types inferred from Zod** ([06](06-Database-Strategy.md), [08](08-API-Strategy.md), [12](12-Coding-Standards.md)); a schema change propagates types automatically.

### M3 — Small team / knowledge concentration
- **L:** Medium · **I:** Medium
- **Risk:** Key-person dependency; onboarding friction.
- **Mitigation:** **Documentation-first** (this blueprint + ADRs); simple, conventional patterns; consistent standards; CODEOWNERS for sensitive areas ([13](13-Git-Strategy.md)).

### M4 — Migration/deploy coordination errors
- **L:** Medium · **I:** Medium
- **Risk:** A schema change breaks against rolled-back app code, or vice versa.
- **Mitigation:** **Expand-then-contract migrations**, versioned in `supabase/`, coordinated with deploys; small reversible releases + instant Vercel rollback + feature flags ([13](13-Git-Strategy.md)).

### M5 — Test coverage gaps on correctness-critical logic
- **L:** Medium · **I:** High
- **Risk:** Because there's no local runtime, untested sync/RLS logic can ship broken.
- **Mitigation:** **Prioritized tests on the idempotent reducer, reconciliation, and RLS isolation** — run in CI, environment-independent ([12](12-Coding-Standards.md) §11); these are exactly the paths that can't be manually verified locally.

---

## 5. Scaling Risks

### SC1 — Free-tier ceilings (realtime connections, DB storage) cap growth
- **L:** Medium–High (with success) · **I:** Medium
- **Risk:** Success hits Supabase/Vercel free-tier limits, threatening availability or forcing an abrupt paid jump.
- **Mitigation:** **Monitor usage from beta**; **retention + purge** bound storage; **tier-upgrade-ready** architecture; **Pro tier prepared** to fund the next tier before limits bite; **70%-of-limit trigger** to act early ([15](15-Scalability-Plan.md) §8).

### SC2 — Single-primary DB write ceiling at large scale
- **L:** Low–Medium (only at high scale) · **I:** Medium
- **Risk:** Write throughput on one primary becomes the bottleneck near 100k users.
- **Mitigation:** **Read replicas** for read-heavy paths (routed via `services/`), **table partitioning** (enabled by UUID+timestamp conventions), higher/dedicated tiers — all forward-compatible ([06](06-Database-Strategy.md), [15](15-Scalability-Plan.md)).

### SC3 — Realtime fan-out volume at scale
- **L:** Low–Medium · **I:** Medium
- **Risk:** Aggregate realtime load grows with users.
- **Mitigation:** **Per-user scoping keeps load linear** (no combinatorial fan-out); batching; provider tier upgrades; provider-agnostic persist-then-broadcast contract allows fronting realtime with more infra if ever needed ([07](07-Realtime-Architecture.md), [15](15-Scalability-Plan.md)).

### SC4 — Search performance on very large corpora
- **L:** Low–Medium · **I:** Low–Medium
- **Risk:** Postgres FTS strains at very high data volumes.
- **Mitigation:** Tune `tsvector`/GIN; **dedicated search service is an option behind the existing search seam** — a contained addition only if proven necessary ([06](06-Database-Strategy.md), [15](15-Scalability-Plan.md)).

---

## 6. Operational / Availability Risks

### O1 — Dependence on managed providers (Supabase/Vercel) during incidents
- **L:** Medium · **I:** Medium
- **Risk:** A provider outage degrades DevSync with limited direct control.
- **Mitigation:** **Graceful degradation** — realtime falls back to periodic reconcile; the app stays usable (persist still works) with a visible status; inherit provider SLAs; transparent status messaging; recover automatically when the provider does ([07](07-Realtime-Architecture.md), [09](09-Error-Handling.md)).

### O2 — Observability gaps (no local runtime to reproduce issues)
- **L:** Medium · **I:** Medium
- **Risk:** Hard to diagnose production issues without local reproduction.
- **Mitigation:** **Sanitized structured logging** (never content/secrets) with correlation ids; Vercel + Supabase logs; **client error reporting**; post-MVP dedicated error monitoring — all designed in from [09](09-Error-Handling.md).

---

## 7. Risk Priority Matrix

| ID | Risk | Dimension | L | I | Priority |
|----|------|-----------|---|---|----------|
| S1 | Cross-user data exposure | Security | Low | Very High | **P0 (architectural)** |
| S2 | XSS via snippet content | Security | Med | High | **P0** |
| M5 | Untested sync/RLS logic | Maintenance | Med | High | **P1** |
| A2 | Build-only-on-Vercel friction | Architecture | High | Med | **P1** |
| S3 | Secret leakage to client | Security | Low–Med | High | **P1** |
| SC1 | Free-tier ceilings | Scaling | Med–High | Med | **P1** |
| S4 | Share-link leakage (v1.1) | Security | Med | High | **P1** |
| P1 | Heavy client bundle (Monaco) | Performance | Med | Med | **P2** |
| P2 | Large-history perf | Performance | Med | Med | **P2** |
| A1 | Vendor lock-in | Architecture | Med | Med | **P2** |
| A3 | Server/client boundary bugs | Architecture | Med | Med | **P2** |
| M1 | Feature tangling | Maintenance | Med | Med | **P2** |
| P4/M2/M4/O1/O2/SC2–4 | (as above) | — | — | — | P2–P3 |

**Reading:** P0 risks are neutralized *by the architecture itself* (RLS, safe rendering + CSP). P1 risks drive engineering discipline (test priorities, build gates, env policy, free-tier monitoring). P2/P3 are managed through the standards, structure, and monitoring already specified.

---

## 8. Overarching Mitigation Themes

1. **Security and sync-correctness are built into the data/realtime layers** — the two highest-severity dimensions (leakage, data loss) are architectural guarantees, not runtime hopes.
2. **The `services/` seam is the insurance policy** — it localizes vendor lock-in, read-replica routing, partitioning, and even backend replacement.
3. **The build constraint is met with static discipline + Vercel preview gates**, not local runtime.
4. **The free-tier mandate is protected by monitoring + retention + a ready paid tier**, with a proactive trigger.
5. **Everything scales by capacity within the same design** — no risk in this register requires a redesign to mitigate.

---

*End of Architecture Risks.*
