# 10 — Security Architecture

**Version:** 1.0 · **Last updated:** 2026-07-22

Security is DevSync's foundation, not a feature — users paste secrets, tokens, and proprietary code. This document specifies authentication, authorization, RLS, secrets, environment variables, rate limiting, input validation, XSS/CSRF defenses, Content Security Policy, and the path to enterprise security. The governing principle: **security is enforced at the data layer, so no client bug can breach isolation.**

---

## 1. Threat Model (what we defend against)

| Threat | Primary defense |
|--------|-----------------|
| One user reading another's snippets | **Row-Level Security** (data-layer isolation). |
| Stolen/lost device retaining access | Per-device revoke + sign-out-everywhere ([05](05-Authentication-Architecture.md)). |
| Credential theft | No password handling; OAuth-delegated; HTTP-only cookies. |
| Injection (SQL/script) | Parameterized Supabase access + Zod validation + output encoding. |
| XSS (snippet content is untrusted text!) | Safe rendering (no raw HTML injection) + CSP. |
| CSRF | SameSite cookies + Server Actions protections + no state-changing GETs. |
| Share-link leakage | Unguessable tokens + expiry + revocation + single-snippet read-only. |
| Secret exposure | Server-only secrets; env var discipline; nothing sensitive client-side. |
| Abuse/DoS on hot endpoints | Rate limiting + size limits. |

**Special note:** snippet **content is inherently untrusted** — a user may paste text containing `<script>` or markup. Rendering it safely is a first-class concern (§9), because a snippet viewed on another of the user's devices (or a public share page) must never execute.

---

## 2. Authentication (summary; full detail in [05](05-Authentication-Architecture.md))

- **Supabase Auth + GitHub/Google OAuth.** No passwords stored or handled by DevSync.
- **Sessions in HTTP-only, secure, SameSite cookies** — server-verifiable, resistant to XSS token theft.
- **Server-side verification** on every protected request (middleware + Server Components/Actions); the client never asserts identity.
- **Token refresh** delegated to Supabase (no custom refresh code — avoids a common bug class).

---

## 3. Authorization (authn ≠ authz)

Authorization is enforced in **layers**, with the database as the final, authoritative boundary:

```
1. Middleware        → gates route access (fast first filter)          [05]
2. Server Action/Route → re-verifies session + validates input        [08]
3. services/         → issues only owner-scoped queries                [02]
4. RLS (PostgreSQL)  → FINAL boundary: rows filtered to auth.uid()     [§4]
```

**Principle of least privilege:** every layer assumes the layers above it may fail. Even if middleware is misconfigured and a Server Action has a bug, **RLS ensures a user can only ever touch their own rows.** Authorization correctness does not depend on application code being bug-free.

---

## 4. Row-Level Security (RLS) — the cornerstone

- **RLS is enabled on every user-data table.** Default posture: **deny all**, then explicit policies grant access.
- **Ownership policy:** a row is accessible only when its owning-account column equals the authenticated user (`auth.uid()`), for select/insert/update/delete respectively. The single owning-account column per row ([06](06-Database-Strategy.md)) is what makes policies simple and auditable.
- **Realtime respects RLS:** change streams only deliver rows the subscriber may see ([07](07-Realtime-Architecture.md)) — isolation extends to the live channel, not just queries.
- **Soft delete + RLS:** policies scope by owner; queries add `deleted_at IS NULL`. Deleted rows remain owner-isolated until purged.
- **Share links (v1.1):** the public read path does **not** disable RLS; it uses a **narrow, purpose-built policy/route** that resolves exactly one snippet by a valid, unexpired, unrevoked token and exposes nothing else — the only sanctioned way content leaves the private boundary.
- **Teams (v3):** add **membership-based policies** (access if the requester is a member of the owning workspace with a sufficient role), layered on the same model without weakening personal-row isolation.

**Why RLS over app-only checks:** it moves the security guarantee to the layer closest to the data, where it cannot be bypassed by a client, a mistaken query, or a future refactor. This is the single most important security decision in the architecture.

---

## 5. Secrets Management

- **Server-only secrets** (Supabase service role key, OAuth client secrets, any signing keys) exist **only** in Vercel's encrypted environment variables and are **never** imported into client bundles.
- **The Supabase service-role key is used sparingly and server-side only** (e.g., privileged maintenance/purge tasks) — never in Server Components that could be confused with client code, and never exposed to the browser.
- **Public keys** (Supabase URL, anon key) are intentionally public but are **safe only because RLS constrains what the anon/authenticated key can do** — the anon key is not a security boundary; RLS is.
- **No secrets in the repo, logs, URLs, or client state** ([09](09-Error-Handling.md), [14](14-Environment-Variables.md)).
- **Rotation:** secrets are rotatable via Vercel/Supabase without code changes; a rotation runbook is a documented operational task.

---

## 6. Environment Variables (security view; full list in [14](14-Environment-Variables.md))

- **Naming makes exposure explicit:** browser-exposed vars use the `NEXT_PUBLIC_` prefix; **everything without that prefix is server-only.** This convention is a security control — a missing/incorrect prefix is a review red flag.
- **Only truly public values get `NEXT_PUBLIC_`** (Supabase URL, anon key, site URL). Secrets never do.
- **Validated at startup:** env vars are validated (shape/presence) so a misconfiguration fails fast and visibly rather than leaking or misbehaving.

---

## 7. Rate Limiting Strategy

- **Where:** at the Route Handler / Server Action boundary for **abuse-prone operations**: OAuth/auth attempts, share-link creation, snippet creation bursts, and (future) public API.
- **How (MVP):** lightweight per-user / per-IP counters with a short window; abusive callers get `RATE_LIMITED` ([09](09-Error-Handling.md)) and a brief cool-down; the UI disables the action temporarily.
- **Backing store:** a small, free-tier-friendly mechanism (e.g., a counter table with TTL semantics, or an edge-compatible limiter) — chosen to avoid new paid infra at MVP; upgradeable to a dedicated limiter (e.g., an edge KV/rate-limit service) as volume grows ([15](15-Scalability-Plan.md)).
- **Size limits** (max content length, max snippets/project rate) complement rate limiting to bound abuse and protect free-tier quotas.
- **Why:** protects availability, cost (free-tier quotas), and share-link/token endpoints from brute force.

---

## 8. Input Validation

- **Zod at every boundary** ([08](08-API-Strategy.md) §3): client convenience + **server-side guarantee**, plus **DB constraints** as the last line. Three independent layers.
- **All external input is validated:** form inputs, action arguments, route params (including the share token format), and query params.
- **Parameterized access only:** the Supabase client parameterizes queries; we never build queries by string concatenation — eliminating SQL injection by construction.

---

## 9. XSS Defense (critical — content is untrusted)

- **Snippet content is treated as untrusted text and rendered as text, never as HTML.** React escapes text by default; we **never** use raw-HTML injection (`dangerouslySetInnerHTML`) with user content.
- **Syntax highlighting via Shiki is done safely:** Shiki tokenizes and produces styled, **escaped** output on the **server**; user content is highlighted, not executed. The Monaco editor operates on plain text values, not executable HTML.
- **The public share page** (v1.1) applies the same safe-rendering rules — a shared snippet containing markup/script is displayed inertly.
- **Output encoding** everywhere user content appears (titles, previews, search highlights).
- **CSP (below)** is the backstop that neutralizes any injected script that somehow slips through.

---

## 10. CSRF Defense

- **SameSite cookies** (session cookies are `SameSite`, `HttpOnly`, `Secure`) prevent cross-site cookie-borne requests.
- **Server Actions** carry framework-level protections against cross-origin invocation.
- **No state-changing GETs** — all mutations are POST-equivalent (actions/handlers), so a malicious `<img>`/link cannot trigger a change.
- **Origin/host checks** on sensitive Route Handlers as defense in depth.

---

## 11. Content Security Policy (CSP)

- **A strict CSP** is served (via response headers / Next.js config) to constrain what the app may load and execute:
  - `default-src 'self'` baseline.
  - Scripts restricted to first-party (and any explicitly required, hashed/nonce'd sources) — **no arbitrary inline/external scripts**, which neutralizes injected `<script>`.
  - Connections (`connect-src`) allow-list **Supabase** endpoints (REST + realtime WSS) and the app origin.
  - Images/styles/fonts constrained to `self` + explicitly needed sources.
  - `frame-ancestors 'none'` (or tightly scoped) to prevent clickjacking.
- **Additional security headers:** HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy` (no leaking), and a restrictive `Permissions-Policy`.
- **Why:** CSP is the safety net that turns a would-be XSS into a blocked resource; combined with safe rendering (§9), it makes content-based script execution extremely hard.
- **Monaco/Shiki consideration:** CSP is tuned to accommodate the editor/highlighter's legitimate needs (e.g., worker/style requirements) **without** opening a general script hole — documented as a specific, reviewed allowance rather than a blanket relaxation.

---

## 12. Data Privacy & Deletion (trust guarantees)

- **Isolation by default** (RLS); content visible only to its owner (and explicit, expiring share recipients).
- **Deletion honored end-to-end:** soft delete → propagation to all devices → purge; **account deletion hard-deletes all user data** ([06](06-Database-Strategy.md) §5).
- **No sensitive data in URLs, logs, or analytics.**
- **Minimal data collection:** identity from the provider, product data only; no selling/third-party sharing of content (PRD NFR-4).

---

## 13. Future Enterprise Security (roadmap-aligned)

Reserved, enabled by the current foundations, built when teams/enterprise arrive:
- **SSO:** SAML/SCIM for org identity and provisioning (extends the OAuth foundation).
- **Audit log:** the append-only `audit_events` ([06](06-Database-Strategy.md) §9) matures into an admin-visible, exportable audit trail.
- **RBAC:** role-based access for team workspaces (membership policies already modeled for RLS).
- **Compliance:** SOC 2 controls, data-residency options, configurable retention/lifecycle policies.
- **Advanced protections:** IP allow-listing, session/device policies, secret-scanning nudges on snippet content.

**Why deferrable safely:** each builds on primitives already present (RLS ownership, per-device sessions, audit columns, env/secret discipline). Nothing here requires a security redesign — only additive hardening.

---

## 14. Security Decision Summary

| Area | Decision | Why |
|------|----------|-----|
| Authorization | RLS at the DB is the final boundary | Cannot be bypassed by client/app bugs. |
| Credentials | OAuth-only, no passwords | Eliminates a whole risk class. |
| Sessions | HTTP-only SameSite Secure cookies | Server-verifiable, XSS/CSRF resistant. |
| Untrusted content | Render as text; Shiki-escaped; no raw HTML | Prevents content-based XSS. |
| Backstop | Strict CSP + security headers | Neutralizes injected scripts/clickjacking. |
| Secrets | Server-only, env-managed, prefix discipline | No client-side secret exposure. |
| Abuse | Rate limits + size limits | Protects availability, cost, tokens. |
| Sharing | Unguessable + expiring + revocable + read-only | Controlled, minimal content egress. |
| Enterprise | Additive on existing primitives | Scales security without redesign. |

---

*End of Security Architecture.*
