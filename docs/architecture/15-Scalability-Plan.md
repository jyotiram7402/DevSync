# 15 — Scalability Plan

**Version:** 1.0 · **Last updated:** 2026-07-22

This document explains how DevSync scales from **100 → 1,000 → 10,000 → 100,000 users without redesigning the architecture.** The thesis, established across the prior documents: the system scales by **capacity and optimization within the same design**, not by re-platforming. Each stage below states the load characteristics, likely bottlenecks, the response, and the cost posture.

The enabling property: **stateless serverless app tier (Vercel) + a single managed, tier-scalable backend (Supabase) + per-user-bounded realtime + RLS-isolated, index-aligned queries.** None of these change shape as users grow.

---

## 1. Why the Architecture Scales by Default

| Property | Why it scales |
|----------|---------------|
| **Stateless app tier** (Vercel serverless/edge) | Horizontal scaling is automatic; no session affinity (sessions are in cookies + Supabase). |
| **Server-first rendering** | Less client JS + cacheable server output → bandwidth and compute scale sub-linearly with users. |
| **Per-user realtime channels** | Fan-out is bounded to a user's own ~2–4 devices; total realtime load grows **linearly with users**, never combinatorially ([07](07-Realtime-Architecture.md)). |
| **RLS + owner-leading indexes** | Every query is naturally selective and index-aligned ([06](06-Database-Strategy.md)); query cost is bounded per user, not by total table size. |
| **Managed backend with tiers** | Scaling = moving up Supabase/Vercel plans + read replicas/pooling, not migrating systems. |
| **Postgres-native search** | No separate search cluster to scale until very large; full-text + GIN carries us far. |

---

## 2. Stage 1 — ~100 users (MVP / private beta)

- **Load:** light. A few hundred devices, low concurrent realtime connections, small data volume.
- **Infrastructure:** **entirely free tier** (Vercel Hobby + Supabase Free) — the PRD mandate.
- **Focus:** correctness of the core loop, not scale. Validate latency (<1s) and reconciliation on real mixed hardware.
- **Bottlenecks:** none expected. The risk here is *bugs*, not *load*.
- **Actions:** instrument metrics (PRD §17); establish the free-tier usage baseline to watch.
- **Cost:** $0.

---

## 3. Stage 2 — ~1,000 users

- **Load:** thousands of devices; realtime connections in the low thousands at peak; data volume growing but modest.
- **Likely first pressure points:**
  - Free-tier **realtime connection limits** and **DB storage** begin to matter ([16](16-Risks.md) SC1).
  - Occasional slow queries surface as histories grow.
- **Responses (no redesign):**
  - **Monitor** realtime connections, DB size, and slow-query logs against free-tier ceilings.
  - **Tune indexes** based on real slow queries ([06](06-Database-Strategy.md) §8).
  - Enforce **retention on free tier** + **purge soft-deleted rows** to bound storage.
  - Ensure **connection pooling** (Supabase pooler) is in front of the serverless functions to avoid connection exhaustion.
  - Prepare (not necessarily launch) the **Pro paid tier** so revenue can fund the first paid infra tier before limits bite (Monetization §5).
- **Cost:** still likely free or the first low paid tier; a deliberate, monitored decision — not a surprise.

---

## 4. Stage 3 — ~10,000 users

- **Load:** tens of thousands of devices; realtime concurrency and write/read throughput meaningfully higher; `snippets` table large.
- **Likely bottlenecks:**
  - **Database read/write throughput** on the hot `snippets` queries.
  - **Realtime capacity** beyond free/low tiers.
  - **Rate-limit store** (MVP counter approach) under contention.
  - Search performance on very large corpora.
- **Responses (still same architecture):**
  - **Move to paid Supabase/Vercel tiers** — more DB CPU/RAM/connections, higher realtime limits, better analytics.
  - **Read replicas** for read-heavy paths (stream/search reads) while writes stay on primary — the app's `services/` layer routes reads/writes, so this is a contained change.
  - **Upgrade rate limiting** to a dedicated edge KV / limiter service ([10](10-Security-Architecture.md) §7; env var reserved in [14](14-Environment-Variables.md)).
  - **Query/index hardening**: verify all hot paths use owner-leading composite indexes; consider **covering indexes** for list previews.
  - **Caching**: lean harder on server-render caching + CDN for cacheable surfaces; keep the client working-cache efficient.
  - **Search**: if Postgres FTS strains, tune the `tsvector`/GIN config; a dedicated search service remains an *option* but is typically not needed yet.
- **Cost:** now a real (but revenue-supported) line item; unit economics protected by efficient queries and metered add-ons (Monetization §6).

---

## 5. Stage 4 — ~100,000 users

- **Load:** hundreds of thousands of devices; high realtime concurrency; very large data volume; global user base.
- **Likely bottlenecks:**
  - Single-primary **database write/throughput ceilings**.
  - **Realtime fan-out** volume at scale.
  - **Storage growth** and long-tail query performance.
  - Global **latency** for distant users.
- **Responses (evolution, not redesign):**
  - **Higher-tier / dedicated Supabase** (or self-managed Postgres if economics dictate) — same data model, more horsepower.
  - **Table partitioning** of `snippets` (by account or time) — enabled by the UUID + timestamp conventions ([06](06-Database-Strategy.md)); a forward-compatible optimization, not a schema rewrite.
  - **Read replicas + connection pooling** scaled out; route heavy reads accordingly via `services/`.
  - **Realtime scaled via provider tiers**; per-user scoping keeps this linear. If ever needed, realtime can be fronted by additional infrastructure without changing the client contract (persist-then-broadcast is provider-agnostic).
  - **Aggressive retention/lifecycle policies** (esp. for free tier) + **archival** of cold data to cheaper storage.
  - **Edge/CDN** already gives global static delivery; server rendering can run at more regions as needed.
  - **Search**: introduce a dedicated search service **only if** Postgres FTS is demonstrably the bottleneck — a contained addition behind the existing search service boundary.
  - **Teams (v3)** workloads scale on the same per-workspace-channel + membership-RLS model ([07](07-Realtime-Architecture.md), [10](10-Security-Architecture.md)).
- **Cost:** significant but funded by the mature monetization engine (Pro + Team/Business + metered AI/storage). Efficiency work directly protects gross margin.

---

## 6. Scaling Levers Summary (what changes at each stage)

```
Stage        App tier         Database                Realtime            Other
──────────   ──────────────   ─────────────────────   ─────────────────   ─────────────────────
100          Vercel free      Supabase free           free tier           instrument metrics
1,000        Vercel free/low  monitor + index tune    monitor limits      retention/purge, pooler
10,000       paid tier        paid + read replicas     paid realtime tier  dedicated rate limiter
100,000      dedicated/region partitioning + replicas  scaled realtime     archival, (opt) search svc
```

**Crucially, every row is a *capacity or optimization* change — never a change to the fundamental architecture, data model, or client contract.**

---

## 7. What Does NOT Change (the invariants)

These hold from 100 to 100,000 users, which is precisely why no redesign is needed:

1. **Persist-then-broadcast + reconcile-on-reconnect** sync contract ([07](07-Realtime-Architecture.md)).
2. **RLS as the authorization boundary** ([10](10-Security-Architecture.md)).
3. **`services/` as the single data-access layer** — the seam where read-replica routing, partitioning, or even a backend migration is absorbed without touching UI.
4. **Per-user (and per-workspace) realtime scoping** — keeps load linear.
5. **Server-first rendering + feature-based modularity** ([02](02-Folder-Structure.md), [03](03-Component-Architecture.md)).
6. **The client contract** — the browser talks to the same shapes regardless of backend capacity behind them.

The `services/` seam (invariant #3) is the key architectural insurance: it means even the most dramatic scaling moves (read replicas, partitioning, a search service, or replacing Supabase) are **localized** and do not ripple into features.

---

## 8. Capacity Planning & Triggers (operational)

- **Watch, don't guess:** realtime connections, DB size/CPU, slow-query count, and free-tier headroom are monitored from beta onward ([16](16-Risks.md) SC1).
- **Pre-defined trigger:** when any free-tier metric crosses ~70% of its limit, the paid-tier upgrade (and, if applicable, Pro launch) is executed **before** users are impacted.
- **Load-shed gracefully:** rate limits + size limits + retention protect the system and cost under unexpected spikes; realtime degrades to periodic reconcile rather than failing ([07](07-Realtime-Architecture.md), [09](09-Error-Handling.md)).
- **Capacity reviews** at each roadmap phase boundary.

---

## 9. Why This Plan Satisfies the Requirement

The business goal requires scaling to thousands (and beyond) **without changing the architecture**. This plan delivers exactly that: growth is met by **tier upgrades, read replicas, pooling, partitioning, retention, and targeted optimization** — all absorbed behind stable seams (`services/`, per-user channels, RLS). The **client contract and data model are invariant**, so features built at 100 users keep working unchanged at 100,000.

---

*End of Scalability Plan.*
