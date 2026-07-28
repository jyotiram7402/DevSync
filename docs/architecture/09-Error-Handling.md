# 09 — Error Handling Strategy

**Version:** 1.0 · **Last updated:** 2026-07-22

This document defines how DevSync handles, communicates, logs, and recovers from errors across every layer. The governing principle from the PRD: **fail safe, never silent** — the product never pretends an operation succeeded when it didn't, and it always gives the user a clear next step.

---

## 1. Error Philosophy

1. **Every error has an audience.** Users get a clear, safe, actionable message; developers get rich detail in logs. Never show users raw internals; never hide failures from users.
2. **Errors are typed and explicit.** Server operations return the typed Result contract ([08](08-API-Strategy.md) §4), not thrown surprises. Errors are handled at known boundaries.
3. **Trust is the priority.** Because DevSync syncs sensitive text, a *silent* failure (or a false success) is worse than a visible error. Sync correctness errors are treated as the highest severity.
4. **Recover automatically where safe; ask the user where not.** Transient issues self-heal (reconnect, retry); ambiguous/destructive situations surface to the user.

---

## 2. Error Taxonomy

Errors are classified by a **stable `code` enum** (shared across server and client) so handling is deterministic:

| Code | Layer | Meaning | Typical UX |
|------|-------|---------|-----------|
| `VALIDATION_FAILED` | Client + Server | Input failed Zod validation | Inline field errors (RHF); no toast spam. |
| `UNAUTHENTICATED` | Server/Auth | No/invalid session | Redirect to sign-in; transparent re-auth if possible. |
| `FORBIDDEN` | Server/RLS | Authenticated but not allowed | Clear "not permitted" message; log (possible probing). |
| `NOT_FOUND` | Server | Resource missing/soft-deleted/expired | Friendly not-found; for shares → "no longer available". |
| `CONFLICT` | Server | Version/LWW conflict edge case | Reconcile to latest; inform user their view refreshed. |
| `RATE_LIMITED` | Server | Too many requests | Ask to slow down; disable action briefly. |
| `REALTIME_DISCONNECTED` | Client | Live channel dropped | "Reconnecting…" status; auto-reconnect. |
| `NETWORK_ERROR` | Client | Request failed (offline/timeout) | Offline banner; queue mutation; retry on reconnect. |
| `INTERNAL` | Server | Unexpected server error | Generic safe message + toast; full detail logged. |

---

## 3. Client Errors

**Sources:** user input mistakes, offline/network failures, clipboard permission denials, unexpected client exceptions.

**Handling:**
- **Input errors** → `VALIDATION_FAILED` rendered as **inline field messages** via React Hook Form (never a modal/toast storm). The same Zod schema that validated informs the messages.
- **Network/offline** → detected by the request layer; triggers the **offline banner** and (for mutations) the **offline queue** ([07](07-Realtime-Architecture.md) §6); a Sonner toast confirms "Saved locally — will sync."
- **Clipboard denied** → `CopyButton` falls back to a select-all + manual-copy affordance with guidance (the hero action must never dead-end).
- **Unexpected render/runtime exceptions** → caught by **React Error Boundaries** at strategic levels (per route segment via `error.tsx`, and around risky client widgets like the Monaco editor) so one broken component doesn't blank the app. The boundary shows a recoverable fallback with a "try again" reset.

**Boundary placement:**
```
app/(app)/error.tsx            → segment-level fallback (keeps top bar/nav usable)
around SnippetEditor (Monaco)  → isolates the heaviest client widget
around SnippetStream           → a render failure in one card can't kill the list
root error boundary            → last-resort full-app fallback
```

---

## 4. Server Errors

**Sources:** Server Actions, Route Handlers, `services/` layer, Supabase calls.

**Handling:**
- Every Server Action/Route runs the pipeline **authn → validate → service call**, each step mapping failures to a typed `code` ([08](08-API-Strategy.md) §7).
- **`services/` returns typed errors**, never throws across the boundary; unexpected exceptions are caught, **logged with full detail server-side**, and returned as `INTERNAL` with a **safe generic message** (no stack traces, no DB text, no PII to the client).
- **Route Handlers** additionally set the correct HTTP status matching the code.
- **Supabase/RLS rejections** map to `FORBIDDEN`/`NOT_FOUND` appropriately — importantly, an RLS denial returns *no data*, so even a bug can't leak another user's rows; the user sees a safe not-found/permission message.

---

## 5. Validation Errors

- **Two-phase** ([08](08-API-Strategy.md) §3): client-side Zod (instant feedback) + server-side Zod (authoritative). The server result carries `fieldErrors` that map to form fields.
- **Presentation:** inline, next to the offending field, via RHF; submit is blocked until valid client-side, and server `fieldErrors` re-populate on rejection.
- **Never trust the client:** server validation is the guarantee; a request that bypasses the UI still gets validated server-side and, failing that, is caught by DB constraints.

---

## 6. Authentication Errors

- **No session / expired** → `UNAUTHENTICATED`: middleware/Server Component redirects to sign-in; where a refresh is possible it happens transparently ([05](05-Authentication-Architecture.md) §7).
- **OAuth failures** (cancel/denied/exchange error) → handled in the callback route with a friendly landing message; **no partial session** is created.
- **Revoked device** → access denied cleanly; the client transitions to signed-out with a clear explanation and re-auth path.
- **Security-relevant auth failures** (repeated failures, revoked-token use) are logged to the audit trail ([06](06-Database-Strategy.md) §9).

---

## 7. Realtime Errors

Given realtime is the core loop, its errors get special care:

- **Channel disconnect** (`REALTIME_DISCONNECTED`) → `SyncStatusIndicator` shows **reconnecting**; auto-reconnect with **exponential backoff + jitter**; on success, **reconcile against truth** before resuming ([07](07-Realtime-Architecture.md) §6).
- **Auth expiry on the socket** → re-authorize the subscription after token refresh; if refresh fails, degrade to signed-out gracefully.
- **Provider outage** → degrade to **manual/periodic reconcile** mode with an explicit "live sync unavailable" status; the app stays usable (persist still works), just not instantaneous. This bounds the blast radius ([16](16-Risks.md) O1).
- **Never silent:** any degradation is visible in the status indicator — the user always knows whether sync is live.

---

## 8. Logging Strategy

**Principles:** log enough to diagnose, never log sensitive content.

| Aspect | Approach |
|--------|----------|
| **What we log** | Error `code`, operation name, user/account id (identifier, not content), device id, timestamps, request/correlation id, and technical error detail (server-side only). |
| **What we NEVER log** | **Snippet content** (may contain secrets), OAuth tokens, full PII, or anything that would turn logs into a data-leak vector. |
| **Where** | Server logs via Vercel's logging (build/runtime) for the app tier; Supabase logs for DB/auth/realtime. A correlation id ties a client error to its server log entry. |
| **Levels** | `error` (unexpected/`INTERNAL`, security events), `warn` (handled-but-notable: rate limits, conflicts, reconnect storms), `info` (key lifecycle), `debug` (dev only, stripped in prod). |
| **Client → server** | Uncaught client errors are reported (sanitized, no content) so we see real-world failures the no-local-runtime constraint hides from us. |
| **Audit vs. logs** | Security-significant *actions* go to the append-only `audit_events` table ([06](06-Database-Strategy.md) §9); operational *errors* go to logs. Distinct concerns. |

**Future:** integrate a dedicated error-monitoring service (e.g., a Sentry-class tool) post-MVP for aggregation/alerting; the sanitized-logging discipline above makes that a drop-in enhancement, not a rework.

---

## 9. Recovery Strategy

| Failure | Recovery |
|---------|----------|
| Transient network / request timeout | Auto-retry with backoff (bounded); queue mutations offline; flush on reconnect. |
| Realtime disconnect | Auto-reconnect + reconcile-against-truth; visible status. |
| Failed mutation (server rejected) | Roll back optimistic UI to last confirmed state; show actionable error; user can retry. |
| Session expiry | Transparent refresh; fallback to re-auth. |
| Component crash | Error boundary fallback with reset; rest of app stays alive. |
| Provider (Supabase/Vercel) incident | Graceful degradation (manual reconcile / read-only feel) + status messaging; recover automatically when the provider does. |
| Conflict (LWW) | Reconcile to authoritative latest; inform the user their view updated; (future) offer version history. |
| Accidental deletion | Soft delete enables recovery within the retention window ([06](06-Database-Strategy.md) §5). |

**Golden rules:**
1. **Optimistic UI always has a rollback path** tied to the confirmed server/DB state.
2. **The user is always informed** of degraded states — no silent failures.
3. **Recovery preserves the no-loss guarantee** — reconciliation and soft delete ensure a failure never destroys data.

---

## 10. Static-Reasoning Aids (environment constraint)

Because Vercel is the first compiler and there's no local runtime, error handling is designed to be **statically verifiable**:
- **Typed Result contract** → every call site must handle `ok:false` (TypeScript enforces the discriminated union).
- **No hidden throws across boundaries** → error paths are explicit and reviewable in code review.
- **Enumerated `code`s** → exhaustive `switch` handling is checkable at build time.
- **Error boundaries at defined segments** → predictable failure isolation without runtime experimentation.

---

*End of Error Handling Strategy.*
