# 05 — Authentication Architecture

**Version:** 1.0 · **Last updated:** 2026-07-22

This document defines authentication and session management: login, logout, sessions, protected routes, middleware, token refresh, security, and multi-device support. It uses **Supabase Auth** with **GitHub** and **Google** OAuth (per PRD). DevSync never handles passwords or provider credentials.

---

## 1. Principles

1. **Delegate identity.** OAuth providers and Supabase Auth own credentials and tokens; DevSync owns only *who is signed in* and *what they can access*.
2. **Server-verified sessions.** The middleware and server code verify the session on every protected request; the client is never trusted to assert identity.
3. **Authorization at the data layer.** Being authenticated ≠ being authorized. RLS ([10](10-Security-Architecture.md)) enforces per-row access regardless of what the client claims.
4. **Multi-device by design.** A user has many devices, each with its own session; revoking one never affects the others.

---

## 2. Login Flow (OAuth)

```
User (browser)        Next.js (Vercel)        Supabase Auth        Provider (GitHub/Google)
    │  click sign-in       │                       │                        │
    ├──────────────────────▶ initiate OAuth ──────▶│  build authorize URL   │
    │                       │                       ├───────── redirect ─────▶│
    │  provider consent screen ◀───────────────────────────────────────────┤
    │  approve ─────────────────────────────────────────────────────────────▶│
    │                       │                       │  code + identity ◀──────┤
    │                       │  /auth/callback  ◀────┤ (redirect w/ code)      │
    │                       │  exchange code →      │                        │
    │                       │  session established  │                        │
    │  Set-Cookie (session) ◀──────────────────────┤                        │
    │  redirect into app    │                       │                        │
    │                       │  register device if new (services/)            │
```

**Steps:**
1. User clicks *Sign in with GitHub/Google* on the landing/auth screen.
2. App initiates the OAuth flow via Supabase Auth (server-side start).
3. Provider shows consent; user approves.
4. Provider redirects back to the **`/auth/callback` Route Handler**, which exchanges the code for a session.
5. Supabase sets the **session cookies** (HTTP-only, secure, SameSite).
6. On first authenticated arrival, the app **registers the device** (see §8) and routes into the dashboard.

**Identity unification:** where a verified email matches an existing account across providers, the identity is unified (per PRD); differing emails create separate accounts (documented limitation; account-linking is future).

**Why OAuth-only / callback as a Route Handler:** OAuth requires a stable server endpoint for the code exchange — a Route Handler is the correct primitive (an external redirect target), whereas Server Actions are for in-app mutations ([08](08-API-Strategy.md)).

---

## 3. Logout Flow

```
User clicks Sign out → Server Action / handler calls Supabase signOut for THIS session
  → session cookies cleared on this device → realtime channel for this device closes
  → redirect to landing.  Other devices remain signed in.
```

- Logout is **scoped to the current device's session** by default (multi-device friendly).
- A separate "sign out everywhere" affordance (settings) can invalidate all sessions — useful for security events; treated as an explicit, confirmed action.

---

## 4. Session Management

- **Storage:** sessions are carried in **secure, HTTP-only cookies** managed by Supabase Auth's SSR integration — readable by the server (middleware, Server Components, Route Handlers) and refreshed transparently. Cookies (not `localStorage`) are used so the **server can verify sessions** and to reduce XSS token-theft exposure.
- **Server/client clients:** three Supabase client configurations live in `lib/` (see [02](02-Folder-Structure.md)):
  - **Browser client** — for Client Components (realtime, client reads).
  - **Server client** — for Server Components/Actions/Route Handlers (reads cookies, respects RLS as the user).
  - **Middleware client** — for the edge middleware to read/refresh the session.
- **Session lifetime:** short-lived access token + longer-lived refresh token (managed by Supabase). The app treats the session as opaque and relies on the SDK for lifecycle.

---

## 5. Protected Routes

Routes are organized into groups (see [02](02-Folder-Structure.md)):
- **`(marketing)`** — public (landing, legal).
- **`(app)`** — authenticated (dashboard, projects, settings, devices).
- **Public share route** — a special public Route Handler/page that is unauthenticated but exposes only a single, valid, unexpired share link's content ([10](10-Security-Architecture.md)).

**Protection is enforced in layers (defense in depth):**
1. **Middleware** (first gate) redirects unauthenticated requests away from `(app)` routes to the landing/sign-in.
2. **Server Components/Actions** re-verify the session (never rely on the client).
3. **RLS** is the final backstop — even a bypassed UI cannot read another user's data.

**Why layered, not middleware-only:** middleware is a fast first filter but must not be the *only* guard; server-side verification + RLS ensure correctness even if middleware is misconfigured.

---

## 6. Middleware

The Next.js **middleware** runs at the edge on matched requests and does exactly two things (kept minimal for correctness and performance):

1. **Session refresh:** reads session cookies via the middleware Supabase client and refreshes the access token when needed, writing updated cookies back on the response. This keeps sessions alive across navigation without client-side token juggling.
2. **Route gating:** for `(app)` routes, if no valid session, redirect to sign-in; for auth routes while already signed in, redirect into the app.

**Constraints:**
- Middleware stays **thin and side-effect-light** (no DB writes, no heavy logic) — it runs on every matched request and must be fast; heavy logic risks edge runtime limits and build fragility.
- The matcher is scoped so middleware runs only where needed (protected routes + auth), not on static assets.

---

## 7. Token Refresh

- Handled **automatically** by Supabase Auth: the middleware refreshes on the server during navigation, and the browser client refreshes for long-lived client sessions (e.g., a tab kept open during a debugging session).
- **Realtime + refresh:** the realtime connection is tied to the session; on token refresh the subscription is re-authorized transparently. On a failed refresh (revoked/expired), the client transitions to a signed-out state gracefully (clear messaging, re-auth prompt).
- **No custom refresh logic** is written — reinventing token refresh is a classic source of security bugs; we rely on the audited provider implementation.

---

## 8. Multi-Device Support

Multi-device is a **first-class product concept** (the whole point of DevSync), so it is modeled explicitly:

- **Device registry:** on first authenticated use on a new device, a **device record** is created for the account (friendly name, platform, last-active). See [06](06-Database-Strategy.md).
- **Per-device sessions:** each device has its own Supabase session; they are independent.
- **Device list & revoke** (settings): users see all devices and can revoke one. Revocation:
  1. invalidates that device's session/access,
  2. closes its realtime channel,
  3. reflects live on the user's other devices (via the same realtime mechanism).
- **Revoking the current device** confirms, then signs out locally.
- **Last-active** is updated on meaningful activity to power the device list.

**Design note — session vs. device:** a *session* is an auth artifact; a *device* is a product entity. We keep them related but distinct so the product's device features (naming, revoke, last-active) are not coupled to auth-provider internals. Mapping a device to its session(s) allows revoke to both end the session and remove product access.

---

## 9. Security Summary (auth-specific; full detail in [10](10-Security-Architecture.md))

| Concern | Approach |
|---------|----------|
| Credential handling | None — delegated to OAuth providers + Supabase Auth. |
| Token storage | HTTP-only, secure, SameSite cookies (not `localStorage`). |
| Session verification | Server-side on every protected request; never client-asserted. |
| Authorization | RLS at the database (authn ≠ authz). |
| CSRF | SameSite cookies + Server Actions' built-in protections + no state-changing GETs. |
| Session fixation / refresh bugs | Delegated to Supabase; no custom refresh code. |
| Lost/stolen device | Per-device revoke + optional sign-out-everywhere. |
| Provider outage | Clear messaging; suggest alternate provider. |

---

## 10. Failure & Edge Cases

| Case | Behavior |
|------|----------|
| OAuth cancelled/denied | Return to landing with a gentle retry message. |
| Callback error / code exchange fails | Friendly error screen; no partial session. |
| Session expired mid-use | Transparent refresh; if refresh fails, graceful sign-out + re-auth prompt. |
| Revoked device attempts action | Access denied at auth/RLS; must re-authenticate. |
| Same person, two providers, same verified email | Unified account. |
| Same person, two providers, different emails | Separate accounts (known limitation; linking is future). |

---

*End of Authentication Architecture.*
