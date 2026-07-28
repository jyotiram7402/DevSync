# 07 — Realtime Architecture

**Version:** 1.0 · **Last updated:** 2026-07-22

This document specifies the realtime sync system — the heart of DevSync. It defines how a snippet moves between devices, how conflicts and duplicate events are handled, how offline devices reconcile, and how the design scales. The guiding contract, from the PRD: **persist-then-broadcast, reconcile-on-reconnect, no silent data loss.**

Technology: **Supabase Realtime** streaming **PostgreSQL change events** over WebSockets, **scoped per user** and aligned with RLS.

---

## 1. The Core Sync Path

```
Device A (author)                Supabase                        Devices B, C (subscribers)
   │                                │                                    │
   │ 1. create/edit/delete          │                                    │
   ├───────────────────────────────▶│                                    │
   │   (Server Action or            │ 2. RLS check: owner? ✓             │
   │    RLS-guarded write)          │ 3. PostgreSQL persists (durable)    │
   │                                │                                    │
   │ 4. ack ◀───────────────────────┤                                    │
   │   (A confirms optimistic UI)   │ 5. Postgres change event           │
   │                                │    on the user's Realtime channel   │
   │                                ├───────────────────────────────────▶│
   │                                │   (WSS, RLS-scoped)                 │ 6. receive event
   │                                │                                    │ 7. idempotent apply
   │                                │                                    │    to synced-entity
   │                                │                                    │    store (by id)
   │                                │                                    │ 8. UI updates live
```

**Non-negotiable ordering:** **persist (step 3) precedes broadcast (step 5).** A snippet can never be "synced but unsaved." If persistence fails, no event is emitted and the author sees an error (fail-safe, never silent).

**Scope guarantee:** the channel is per user and RLS-aligned, so a subscriber only ever receives events for rows it owns. One user's snippets are never delivered to another user.

**Latency target:** steps 1–8 within ~1 second under normal conditions (PRD NFR-1).

---

## 2. Channel & Subscription Model

- **One logical channel per user**, carrying change events for that user's rows (snippets, projects, devices).
- **Subscription lifecycle:** established by a Client Component (the realtime hook, e.g. `useRealtimeSnippets`) after auth, torn down on sign-out/unmount, re-authorized on token refresh ([05](05-Authentication-Architecture.md)).
- **Event shape (normalized in the client):** `{ table, eventType: INSERT|UPDATE|DELETE, id, payload, updated_at }`.
- **Why per-user (not per-project or global):**
  - **Per-user** keeps fan-out bounded to a user's own devices (typically 2–4), which is cheap and scales linearly with users rather than with data.
  - A **global** channel would leak scope and explode fan-out; **per-project** channels would multiply connections and complicate switching. Per-user is the right granularity for a personal sync product.
- **Filtering:** the subscription is filtered to the owner; project/type filtering is applied client-side against the already-owner-scoped stream (cheap, and avoids re-subscribing when switching projects).

---

## 3. How a Snippet Moves (end to end)

Mapping the PRD diagram (Browser → Supabase → Realtime → Other devices) to concrete mechanics:

```
Browser (Device A)
  └─ user creates snippet
      └─ optimistic insert into A's local synced-entity store (instant UI)
      └─ Server Action: Zod-validate → services/ → RLS-guarded INSERT
Supabase
  └─ PostgreSQL persists row (source of truth) + updates search vector + triggers updated_at
Realtime
  └─ emits INSERT event on the user's channel (only after commit)
Other devices (B, C)
  └─ realtime hook receives INSERT
      └─ idempotent upsert into their synced-entity store (keyed by snippet id)
          └─ SnippetCard appears at top + brief highlight (+ optional Sonner toast [v1.1])
Author (A)
  └─ Server Action ack confirms the optimistic entry (or rolls back on failure)
      └─ (A may also receive its own echo event — deduped by id, see §5)
```

---

## 4. Conflict Handling

Conflicts are rare in DevSync (a user editing the *same* snippet on two of *their own* devices within the sync window), but the policy is explicit:

- **MVP policy — Last-Write-Wins (LWW) at the whole-snippet level**, decided by `updated_at` (DB-maintained, UTC, [06](06-Database-Strategy.md)). The later write is authoritative; earlier concurrent edits to the same snippet are overwritten.
- **Why LWW at MVP:**
  1. Concurrent edits to the same snippet across one's own devices are uncommon; the complexity of field-level merging or CRDTs is unjustified for the MVP payoff.
  2. `updated_at` timestamps make the outcome **deterministic and explainable**.
  3. It is simple to reason about statically (important given no local runtime).
- **Loss mitigation:** because deletes are soft and updates are timestamped, a "lost" edit is not catastrophic; **snippet version history** is a documented post-MVP enhancement that upgrades LWW into recoverable history without changing the sync contract.
- **Creates/deletes don't conflict:** creates have unique ids; deletes are idempotent (deleting an already-deleted snippet is a no-op).

---

## 5. Duplicate-Event Avoidance (idempotency)

Duplicates can arise from: the author receiving its own echo, at-least-once delivery, or reconnect re-pulls overlapping with live events. All are neutralized by **idempotent, id-keyed application**:

- **Every entity has a stable UUID** (often client-generated at creation, [06](06-Database-Strategy.md) §4), so an event is identified by `id` + `updated_at`.
- **Apply rules (idempotent reducer):**
  - `INSERT`: **upsert** by id — if it already exists (e.g., the author's optimistic entry), reconcile rather than duplicate.
  - `UPDATE`: **patch** by id; ignore an incoming update whose `updated_at` is older than what's already applied (stale echo protection).
  - `DELETE`: **remove** by id; if already absent, no-op.
- **Author echo:** the author's optimistic entry uses the same id it sends to the server, so the echoed INSERT reconciles to the same record — no duplicate card.
- **Result:** applying any event any number of times yields the same state. This is the single most important correctness property of the client cache ([04](04-State-Management.md) §6).

---

## 6. Offline & Reconnection (reconciliation)

The contract: **no lost snippets, no duplicates**, even across disconnects, sleep, or flaky networks.

```
Device offline (misses events)                 Device reconnects
        │                                              │
        │                                              │ 1. WebSocket reconnect (with backoff)
        │                                              │ 2. Re-authorize channel (fresh token)
        │                                              │ 3. RE-PULL authoritative state via services/
        │                                              │    (owner-scoped query since a checkpoint)
        │                                              │ 4. Idempotent merge into the store
        │                                              │    (upsert live rows, remove tombstoned)
        │                                              │ 5. Resume live event stream
        │                                              │ 6. Sync status → "connected"
```

**Mechanics & principles:**
- **Reconcile against truth, not the local cache.** On reconnect the device trusts Postgres, closing any gap in missed events.
- **Checkpointing:** the client tracks the latest applied `updated_at`/timestamp so the re-pull fetches only what changed since it went offline (bounded, efficient) — with soft-deletes ensuring deletions are represented (as tombstones) rather than silently missing.
- **Idempotent merge** (§5) means the re-pull can safely overlap with the resumed live stream.
- **Offline authoring:** snippets created while offline are queued locally (with their client-generated ids) and flushed on reconnect; UI shows a "pending sync" state until persisted. Because ids are stable, the later echo reconciles cleanly.
- **Visible state throughout:** `SyncStatusIndicator` shows offline → reconnecting → connected so trust survives the gap (PRD UX principle).
- **Backoff:** reconnection uses exponential backoff with jitter to avoid thundering-herd reconnects after a provider blip.

---

## 7. Failure Modes & Guarantees (summary)

| Scenario | Guarantee / behavior |
|----------|---------------------|
| Write fails to persist | No broadcast; author sees error; optimistic entry rolled back. Never "synced but unsaved." |
| Author receives own echo | Deduped by id (optimistic entry reconciles). |
| Duplicate/at-least-once delivery | Idempotent apply → no duplicates. |
| Stale update arrives after newer one | Ignored via `updated_at` comparison. |
| Device offline during changes | Re-pull + idempotent merge on reconnect → no loss, no dupes. |
| Channel drops | Auto-reconnect w/ backoff + re-authorize + reconcile; visible "reconnecting". |
| Concurrent edit, same snippet, two devices | LWW by `updated_at` (MVP); recoverable via future versioning. |
| Token refresh mid-session | Subscription re-authorized transparently. |
| Revoked device | Channel closes; access denied; must re-auth. |

---

## 8. Future Scaling

The per-user, persist-then-broadcast model scales by **capacity, not redesign**:

1. **Connection volume:** realtime connections scale with *active devices*, not total data. Growth is handled by moving up Supabase realtime tiers ([15](15-Scalability-Plan.md)); per-user scoping keeps per-connection cost bounded.
2. **Event volume / batching:** rapid successive changes (e.g., a burst of pastes) are **batched** in the client apply layer and, where possible, coalesced in the UI (single highlight, batched toast) to avoid render thrash.
3. **Fan-out ceiling:** because a user's fan-out is limited to their own handful of devices, there is no combinatorial fan-out explosion as users grow — the system scales horizontally with users.
4. **Team realtime (v3):** shared collections introduce **workspace-scoped channels** layered on the same model (RLS-aligned membership policies). This is additive: personal channels remain per-user; team channels are per-workspace.
5. **Presence & typing indicators (future):** Supabase Realtime presence can layer on for collaboration features without altering the core change-stream design.
6. **Degradation strategy:** if realtime is unavailable (provider incident), the app degrades to a **manual refresh / periodic reconcile** mode with a clear status indicator — the product stays usable (read/create still persist), just not instantaneous. This bounds the blast radius of a realtime outage ([16](16-Risks.md) O1).

---

## 9. Why This Design Meets the PRD

- **Instant, reliable sync:** persist-then-broadcast + ~1s target + live idempotent apply.
- **No silent data loss:** reconcile-against-truth + idempotency + soft-delete tombstones + visible status.
- **Private:** per-user, RLS-aligned channels.
- **Free-tier viable:** no extra messaging infra; realtime rides the DB; fan-out bounded per user.
- **Scales without rewrite:** capacity-based scaling; additive team channels for v3.
- **Statically reasonable:** deterministic LWW + idempotent reducer are easy to verify without a local runtime.

---

*End of Realtime Architecture.*
