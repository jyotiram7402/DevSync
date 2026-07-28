# 11 — Performance Strategy

**Version:** 1.0 · **Last updated:** 2026-07-22

This document defines how DevSync stays fast and cheap: lazy loading, dynamic imports, code splitting, pagination, infinite scroll, image optimization, caching, database indexing, and realtime optimization. Targets come from the PRD NFRs: **initial authenticated load < 3s, perceived sync latency < 1s.**

Performance is also a **cost** strategy here — efficient queries and bounded payloads directly protect the free-tier budget.

---

## 1. Performance Budget & Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Authenticated first load | < 3s (typical broadband) | PRD NFR-1. |
| Perceived sync latency | < 1s device-to-device | PRD NFR-1 / core loop. |
| Initial JS on the dashboard | Minimal — editor/highlighter excluded from critical path | Server-first rendering. |
| Snippet list interaction | Smooth at large history (virtualized) | Power users accumulate thousands of snippets. |
| Search response | Sub-second on indexed full-text | PRD goal G2. |

**Overarching lever:** **server-first rendering** (React Server Components) ships less JavaScript than a client-heavy SPA, which is the biggest single win for load time and cost.

---

## 2. Server Components First (the foundational decision)

- **Default to Server Components** for pages, lists, and read views ([03](03-Component-Architecture.md)). They render on the server, ship HTML, and include **no component JS** for non-interactive parts.
- **Client Components only for interactive leaves** (editor, forms, realtime host, copy button). This keeps the client bundle small by construction.
- **Impact:** the dashboard's snippet stream and read views are largely JS-free; the browser downloads interactive code only where needed.

---

## 3. Lazy Loading & Dynamic Imports

- **Monaco Editor is dynamically imported** and loaded **only when a user actually edits/creates** a large snippet — never on initial load. Monaco is heavy; keeping it off the critical path is the single most important client-side performance decision.
- **Other heavy/rare widgets** (analytics charts [v2], future dashboards) are dynamically imported per route/interaction.
- **Route-level code splitting is automatic** with the App Router — each route segment ships its own chunk.
- **Below-the-fold / modal content** (dialogs, settings panels) loads on demand.
- **Shiki** highlighting runs **server-side** for read views, so the highlighter and language grammars don't ship to the client at all for viewing.

```
Initial dashboard load  →  Server-rendered list + tiny interactive leaves  (fast, small)
User clicks "Edit"      →  dynamic import Monaco  (paid only when needed)
User views a snippet    →  Shiki-highlighted HTML from the server  (zero client highlighter)
```

---

## 4. Code Splitting Strategy

- **By route** (automatic, App Router): each page/segment is its own chunk.
- **By interaction** (dynamic import): heavy features load on first use.
- **By feature boundary** ([02](02-Folder-Structure.md)): feature modules split naturally, so unused features aren't in the initial bundle.
- **Shared vendor chunking:** common libraries are split into cacheable shared chunks so navigation reuses them.
- **Guardrail:** watch bundle size in Vercel build output; a heavy dependency creeping into the shared/critical chunk is treated as a regression.

---

## 5. Pagination & Infinite Scroll

- **The snippet stream is paginated**, not fetched all at once — essential for power users with large histories and for free-tier query cost.
- **Cursor-based pagination** keyed on `(created_at, id)` (not offset) — stable under inserts (new snippets arrive via realtime without shifting pages) and index-friendly ([06](06-Database-Strategy.md) §8).
- **Infinite scroll** on the stream: additional pages load as the user scrolls, with a sentinel/intersection trigger; a "load more" fallback for accessibility/keyboard users.
- **List virtualization** for very long rendered lists so the DOM stays light regardless of history size.
- **Realtime + pagination coherence:** new snippets from realtime prepend to the top (page 0) without disturbing already-loaded pages; the cursor model ensures no duplicates/gaps ([07](07-Realtime-Architecture.md)).

---

## 6. Image & Asset Optimization

- **Next.js image optimization** for any images (avatars, marketing, future attachments): responsive sizes, modern formats, lazy loading by default.
- **MVP is text-only**, so image load is minimal (avatars, static marketing) — but the discipline is set for the future file/attachment roadmap.
- **Static assets** are hashed and served from Vercel's CDN with long-lived immutable caching.
- **Fonts** are optimized/self-hosted via Next.js font handling to avoid layout shift and third-party requests (also a CSP benefit, [10](10-Security-Architecture.md)).
- **Icons (Lucide)** are tree-shaken so only used icons ship.

---

## 7. Caching (layers)

Mirrors [04](04-State-Management.md) §5, viewed through a performance lens:

| Layer | Cache | Benefit |
|-------|-------|---------|
| CDN/edge (Vercel) | Static + cacheable responses | Global low-latency delivery. |
| Server render | RSC output / route caching with targeted revalidation | Avoids recomputing unchanged views; revalidated on mutation. |
| Client working cache | Zustand synced-entity store | Instant navigation/interaction; kept live by realtime. |
| Browser | Immutable hashed assets | Repeat visits are near-instant. |

**Revalidation discipline:** mutations revalidate exactly the affected server-cached views (not blanket cache busting), so caches stay both fresh and effective.

---

## 8. Database Performance

- **Indexes match query shape** — owner-leading composite indexes for the stream and project views; **GIN index** for full-text search; partial indexes exclude soft-deleted rows ([06](06-Database-Strategy.md) §8).
- **Owner-scoped queries** (RLS) are naturally selective and index-aligned.
- **Bounded payloads:** select only needed columns (avoid pulling full content in list views — use previews; fetch full content on open).
- **Cursor pagination** avoids expensive offset scans.
- **Content size limits** keep rows small and search vectors efficient.
- **Add indexes on evidence:** beyond the known-hot set, new indexes come from observed slow queries (avoids write amplification / free-tier bloat).
- **Connection pooling** via Supabase's pooler so serverless functions (Vercel) don't exhaust DB connections — important for the serverless execution model.

---

## 9. Realtime Optimization

- **Per-user scoped channels** keep fan-out and per-connection cost bounded ([07](07-Realtime-Architecture.md)).
- **Event batching/coalescing:** bursts of changes are batched in the client apply layer; UI updates (highlights, toasts) are coalesced to prevent render thrash.
- **Idempotent, id-keyed apply** avoids redundant re-renders (stale/duplicate events are dropped cheaply).
- **Selector-based store subscriptions** (Zustand) so only components reading a changed slice re-render.
- **Payload minimalism:** realtime carries the changed row; large content is already local or fetched on open, not re-streamed unnecessarily.
- **Graceful degradation** to periodic reconcile if realtime is down — protects UX during provider issues without a performance cliff.

---

## 10. Rendering & Interaction Performance

- **Streaming SSR / Suspense:** stream server-rendered content with meaningful `loading.tsx` skeletons so the shell paints fast while data resolves.
- **Optimistic UI** for create/edit/delete → interactions feel instant; confirmed asynchronously ([04](04-State-Management.md)).
- **Transitions** (React 19 `useTransition`) keep the UI responsive during non-urgent updates (e.g., applying a filter).
- **Debounced search input** to avoid a query per keystroke while keeping results live ([04](04-State-Management.md)).
- **Avoid layout shift:** skeletons and reserved space for async content (good CLS).

---

## 11. Measurement & Guardrails

- **Vercel Analytics / Web Vitals** (free tier) to monitor real load performance (LCP, CLS, INP).
- **Bundle-size watch** in the build output; regressions flagged in review.
- **Query performance** monitored via Supabase; slow queries drive new indexes.
- **Realtime latency** tracked against the <1s target (reliability metric, PRD §17).
- **Performance is part of code review** — a heavy dependency or a client-ified page is a review blocker.

---

## 12. Performance ↔ Cost Link (free-tier protection)

Every performance decision doubles as a cost control:
- Server-first + splitting → less bandwidth/compute.
- Pagination + bounded payloads + indexes → fewer/cheaper DB reads.
- Per-user realtime scoping + batching → bounded realtime usage.
- Caching + CDN → fewer origin hits.

This is why performance is a first-class architectural concern and not just polish: **staying fast is how DevSync stays free** at MVP and profitable at scale ([15](15-Scalability-Plan.md), [16](16-Risks.md) SC1).

---

*End of Performance Strategy.*
