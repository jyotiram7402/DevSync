# DevSync — Data Flow

**Version:** 1.0
**Last updated:** 2026-07-22

This document describes how information travels through DevSync at a conceptual/architectural level. It uses diagrams to show the flows that matter most: the core sync loop, offline reconciliation, authentication, and sharing. It is **not** an implementation spec — no schemas, no code — but it defines the contracts every implementation must honor.

---

## 1. System Context (high level)

```
        ┌─────────────────────────────────────────────────────────┐
        │                      USER'S DEVICES                       │
        │   Device A            Device B            Device C        │
        │  (browser)           (browser)           (browser)        │
        └───────┬───────────────────┬──────────────────┬───────────┘
                │                    │                  │
                │  HTTPS / WebSocket (TLS)              │
                ▼                    ▼                  ▼
        ┌─────────────────────────────────────────────────────────┐
        │                    VERCEL (Next.js app)                   │
        │   - Serves UI (SSR/edge)                                  │
        │   - Hosts server routes for privileged/server logic       │
        └───────────────────────────┬─────────────────────────────┘
                                     │  (via Supabase client / server)
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │                        SUPABASE                           │
        │  ┌───────────┐  ┌───────────┐  ┌───────────────────────┐ │
        │  │   Auth    │  │ PostgreSQL │  │  Realtime (change     │ │
        │  │ (OAuth)   │  │ + Row-Level│  │  streams over WS)     │ │
        │  │           │  │  Security  │  │                       │ │
        │  └───────────┘  └───────────┘  └───────────────────────┘ │
        └─────────────────────────────────────────────────────────┘
                                     │
                         External identity providers
                          (GitHub OAuth, Google OAuth)
```

**Key architectural decisions:**
- **Postgres is the single source of truth.** All state (snippets, projects, devices) lives there. Devices hold only a synchronized cache/view.
- **Realtime rides on database changes.** Sync is driven by Postgres change events streamed over WebSockets, so a write is the same act as a broadcast — there is no separate messaging system to keep consistent with the database.
- **Security is enforced at the data layer** via Row-Level Security (RLS), not only in application code. Even if the client is compromised, users can only ever read/write their own rows.

---

## 2. The Core Sync Loop (create → everywhere)

This is the heart of the product.

```
 User on Device A                Supabase                 Devices B, C …
       │                            │                           │
       │ 1. Create snippet          │                           │
       ├───────────────────────────▶│                           │
       │   (write over TLS)         │                           │
       │                            │ 2. RLS check: is this      │
       │                            │    the owner? ✓            │
       │                            │ 3. Durably persist row     │
       │                            │    in PostgreSQL           │
       │                            │                            │
       │ 4. Ack (row saved)         │                            │
       │◀───────────────────────────┤                            │
       │  (A shows it immediately)  │                            │
       │                            │ 5. Emit change event       │
       │                            │    on the user's channel   │
       │                            ├───────────────────────────▶│
       │                            │   (Realtime over WS)       │
       │                            │                            │ 6. B, C receive event,
       │                            │                            │    RLS-scoped to owner
       │                            │                            │ 7. Update local view
       │                            │                            │    (snippet appears,
       │                            │                            │     brief highlight)
```

**Ordering guarantee:** The row is **persisted before it is broadcast** (step 3 precedes step 5). A snippet can never be "synced but not saved." If persistence fails, no broadcast occurs and Device A surfaces the error (fail-safe, never silent).

**Scope guarantee:** The realtime channel is scoped per user; RLS ensures a device only ever receives events for rows it owns. A user's snippets are never broadcast to another user.

**Latency target:** steps 1–7 complete within ~1 second under normal conditions (NFR-1).

---

## 3. Update and Delete Flows

Updates and deletes follow the same persist-then-broadcast pattern:

```
Update:  Device A edits metadata → RLS check → persist update → ack →
         broadcast "updated" → B, C patch the snippet in place.

Delete:  Device A deletes → RLS check → remove row → ack →
         broadcast "deleted" → B, C remove the snippet from view.
```

**Conflict handling (MVP):** If two devices edit the same snippet nearly simultaneously, the last write to reach Postgres wins for the whole snippet; timestamps make the outcome explainable. Field-level merge and version history are deferred (post-MVP), documented as a known limitation. This is acceptable because concurrent edits to the *same* snippet on two of one's *own* devices are rare.

**Delete safety:** Deletion propagates to all devices so a "deleted" snippet never lingers on a stale device. Account/project deletion flows prompt for disposition to avoid accidental bulk loss.

---

## 4. Offline & Reconnection (reconciliation)

The hardest correctness problem in a sync product. The contract: **no lost snippets, no duplicates.**

```
Device B goes offline …                      … Device B comes back online
       │                                                │
       │ (misses events emitted while away)             │
       │                                                │ 1. Reconnect WS
       │                                                │ 2. Re-authenticate channel
       │                                                │ 3. Pull authoritative state
       │                                                │    since last-known point
       │                                                │    (Postgres = source of truth)
       │                                                │ 4. Merge: add missed snippets,
       │                                                │    apply missed updates/deletes
       │                                                │ 5. Resume live event stream
       │                                                │    (show "connected" state)
```

**Principles:**
- **Source of truth is authoritative.** On reconnect, the device reconciles against Postgres rather than trusting a possibly-incomplete local cache.
- **Idempotent application.** Applying the same change twice yields the same result (safe against duplicate delivery).
- **Locally created while offline:** queued on the device, flushed on reconnect, shown as "pending" until persisted — never silently dropped.
- **Visible state:** the user always sees offline → reconnecting → connected, so trust is maintained through the gap.

---

## 5. Authentication Flow

```
 User          Vercel (app)        Supabase Auth        Provider (GitHub/Google)
   │  1. Click sign in   │                 │                       │
   ├────────────────────▶│                 │                       │
   │                     │ 2. Start OAuth  │                       │
   │                     ├────────────────▶│ 3. Redirect to        │
   │                     │                 ├──────────────────────▶│
   │  4. Consent screen  │                 │                       │
   │◀───────────────────────────────────────────────────────────┤
   │  5. Approve         │                 │                       │
   ├─────────────────────────────────────────────────────────────▶
   │                     │                 │ 6. Provider returns    │
   │                     │                 │◀───────identity────────┤
   │                     │ 7. Session      │                       │
   │                     │◀────established──┤                       │
   │  8. Land in app     │                 │                       │
   │◀────────────────────┤                 │                       │
   │                     │ 9. Register device if new              │
```

**Notes:**
- DevSync never handles passwords or provider credentials — the managed auth provider and the identity provider do. This eliminates an entire class of security risk (NFR-3).
- Session tokens are managed by the auth provider; the app treats identity as given and enforces per-row access via RLS keyed to the authenticated user.
- Device registration attaches to the account on first authenticated use.

---

## 6. Search Flow

```
User types query → app queries Postgres full-text index (RLS-scoped to user)
   → ranked results returned (paginated) → rendered live as the user types
   → filters (project/type/date) applied as additional constraints.
```

- Search executes against the source of truth (Postgres), not the local cache, so results are complete even for snippets not currently loaded on the device.
- RLS guarantees search only ever returns the requesting user's snippets.

---

## 7. Sharing Flow `[v1.1]`

```
Owner generates share link → server creates an unguessable, expiring, read-only
   pointer to ONE snippet → link sent externally by the owner.

Recipient opens link → public route resolves the pointer:
   - valid & unexpired → render read-only snippet content only
   - expired/revoked/invalid → "no longer available" (no content, no data leak)
```

- Share links are the **only** path by which snippet content leaves the private, RLS-protected boundary — and only for a single snippet, read-only, with mandatory expiry and one-click revocation.
- The public view exposes nothing about the account, other snippets, or projects.

---

## 8. Data Classification & Handling

| Data | Sensitivity | Handling principle |
|------|-------------|--------------------|
| Snippet content | **High** (may contain secrets/proprietary code) | RLS-isolated; TLS in transit; treated as sensitive by default; deletable everywhere. |
| Snippet metadata (title/type/project) | Medium | Same isolation as content. |
| Device info (name/platform/last active) | Low–Medium | Account-scoped; used for the device registry. |
| Identity (name/email/avatar) | Medium | Sourced from provider; minimal storage; used for account identity. |
| Share links | High (grants access) | Unguessable, expiring, revocable, single-snippet, read-only. |

**Cross-cutting rules:**
- No sensitive data in URLs or query strings.
- Data isolation enforced at the database layer, not just the app.
- Deletion is honored end-to-end (all devices + source of truth).

---

## 9. Failure Modes & Guarantees (summary)

| Scenario | Guarantee |
|----------|-----------|
| Write fails to persist | No broadcast; error surfaced to the originating device. Never "synced but unsaved." |
| Device offline during change | Reconciles on reconnect; no loss, no duplicates. |
| Realtime channel drops | Auto-reconnect + state re-sync; visible reconnecting state. |
| Concurrent edits (same snippet, two devices) | Last-write-wins (MVP), explainable via timestamps; versioning deferred. |
| Revoked device attempts access | Denied cleanly at the auth/RLS layer. |
| Provider/auth outage | Clear messaging; suggest alternate provider; no partial/broken session. |

---

## 10. Why This Architecture Satisfies the Constraints

- **Free-tier:** One managed backend (Supabase) provides DB + auth + realtime; hosting/CI on Vercel. No extra infrastructure, no recurring cost at MVP.
- **Scales without rewrite:** The persist-then-broadcast, RLS-scoped, Postgres-as-truth model is the same at 100 or 100,000 users; scaling is a matter of moving to higher tiers of the same services, not redesigning.
- **Trustworthy:** Security at the data layer + no password handling + explicit deletion + visible sync state.
- **Reliable:** Persist-before-broadcast and reconcile-on-reconnect directly implement the "no silent data loss" non-functional requirement.

---

*End of Data Flow.*
