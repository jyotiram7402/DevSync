# 14 — Environment Variables

**Version:** 1.0 · **Last updated:** 2026-07-22

This document enumerates every environment variable DevSync uses, its purpose, where it lives, and its exposure class, and provides a professional **`.env.example` specification**. **No real secrets appear here** — placeholders only. Secrets live exclusively in Vercel's encrypted environment settings ([10](10-Security-Architecture.md)).

---

## 1. Governing Rules

1. **Exposure is encoded in the name.** Variables prefixed **`NEXT_PUBLIC_`** are bundled into the browser and are therefore **public**. Everything else is **server-only** and must never reach the client. This naming convention is a **security control**, not a formality.
2. **Only genuinely public values get `NEXT_PUBLIC_`.** The Supabase URL and anon key are public *by design* (safe only because RLS constrains them — [10](10-Security-Architecture.md) §5). Secrets never get the prefix.
3. **No secrets in git.** `.gitignore` excludes all `.env*` files except `.env.example`. `.env.example` documents the shape with placeholders only.
4. **Validated at startup.** Environment variables are validated (presence + shape, e.g., via a Zod env schema in `lib/`) so a misconfiguration **fails fast and loudly** during build/boot rather than causing subtle runtime leaks or errors — especially valuable given Vercel is the first build.
5. **Set per environment in Vercel.** Preview and Production each have their own values; preview points at a non-production Supabase environment ([13](13-Git-Strategy.md)).

---

## 2. Variable Catalog

### 2.1 Public (browser-exposed — `NEXT_PUBLIC_`)

| Variable | Purpose | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Base URL of the Supabase project; used by the browser Supabase client (REST + realtime WSS). | Public by design; safe because RLS governs access. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/publishable key for the browser client. | Public by design; **not** a security boundary — RLS is. Never use the service-role key here. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (e.g., `https://devsync.app`); used for OAuth redirect construction, share-link base, absolute URLs, OG metadata. | Must match the deployed domain per environment. |
| `NEXT_PUBLIC_APP_ENV` | Human-facing environment label (`development` / `preview` / `production`) for non-secret UI/telemetry context. | Optional; convenience for environment-aware UI/logging. |

### 2.2 Server-only (secrets & privileged config — **no** `NEXT_PUBLIC_`)

| Variable | Purpose | Notes |
|----------|---------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged Supabase key for **server-only** elevated tasks (maintenance, purge of soft-deleted rows, admin ops). Bypasses RLS — **highest-sensitivity secret.** | Server-only; used sparingly in trusted server code; never imported into client bundles or Server Components that render to the client. |
| `SUPABASE_JWT_SECRET` | Used server-side where JWT verification/signing is required (if/when needed for custom token handling). | Server-only; only present if a use case requires it. |
| `SUPABASE_DB_URL` | Direct/pooled Postgres connection string for migrations/admin tooling in `supabase/`. | Server/tooling only; not used by app runtime request paths (which go through the Supabase client). |
| `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth app client id (configured in Supabase Auth; mirrored here if server-side reference is needed). | Server-only. The id is low-sensitivity but kept server-side for consistency. |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth app client secret. | **Secret.** Primarily configured in the Supabase Auth dashboard; documented here for completeness. |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client id. | Server-only. |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth client secret. | **Secret.** Configured in Supabase Auth dashboard. |
| `RATE_LIMIT_REDIS_URL` *(future)* | Connection for a dedicated rate-limit/edge-KV store when MVP counters are outgrown ([10](10-Security-Architecture.md) §7, [15](15-Scalability-Plan.md)). | Server-only; not required at MVP. |
| `SENTRY_DSN` *(future)* | Error-monitoring ingestion endpoint ([09](09-Error-Handling.md)). | Server-only (or a public DSN variant if a client SDK is added later, evaluated then). |
| `CRON_SECRET` *(future)* | Shared secret to authenticate scheduled jobs (purge, retention) hitting a protected Route Handler. | Server-only. |

> **Note on OAuth secrets:** GitHub/Google client secrets are chiefly configured **inside the Supabase Auth dashboard**, not consumed directly by the Next.js app at runtime. They are catalogued here so the full secret inventory is documented in one place and handled with the same discipline. Whether they are also stored as app env vars depends on whether any server code needs them directly; if not, they remain only in Supabase.

---

## 3. Exposure Classification Summary

```
PUBLIC (shipped to browser)              SERVER-ONLY (never in client bundle)
────────────────────────────            ─────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL                 SUPABASE_SERVICE_ROLE_KEY   ← most sensitive
NEXT_PUBLIC_SUPABASE_ANON_KEY            SUPABASE_JWT_SECRET
NEXT_PUBLIC_SITE_URL                     SUPABASE_DB_URL
NEXT_PUBLIC_APP_ENV                      GITHUB_OAUTH_CLIENT_ID / _SECRET
                                         GOOGLE_OAUTH_CLIENT_ID / _SECRET
                                         RATE_LIMIT_REDIS_URL (future)
                                         SENTRY_DSN (future)
                                         CRON_SECRET (future)
```

**Review rule:** any PR that adds a `NEXT_PUBLIC_` variable, or that references a server-only variable in client code, is flagged in review ([13](13-Git-Strategy.md)). A secret with a public prefix is a **blocking** security defect.

---

## 4. `.env.example` Specification

The repository contains a committed **`.env.example`** (placeholders only, no real values) that serves as the contract for required configuration. Its specified contents:

```dotenv
# ─────────────────────────────────────────────────────────────
# DevSync — Environment Variables (EXAMPLE / TEMPLATE)
# Copy to `.env.local` for real values. NEVER commit real secrets.
# Values here are placeholders only.
# ─────────────────────────────────────────────────────────────

# ── PUBLIC (exposed to the browser via NEXT_PUBLIC_ prefix) ──
# Safe to expose. The anon key is NOT a security boundary — RLS is.
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"          # set to the real domain per env
NEXT_PUBLIC_APP_ENV="development"                     # development | preview | production

# ── SERVER-ONLY (NEVER prefix with NEXT_PUBLIC_; never sent to client) ──
# Highest sensitivity: bypasses Row-Level Security. Server code only.
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_JWT_SECRET="your-jwt-secret"                 # only if custom JWT handling is needed
SUPABASE_DB_URL="postgresql://user:password@host:port/database"  # migrations/admin tooling

# OAuth (primarily configured in the Supabase Auth dashboard).
# Include here only if server code references them directly.
GITHUB_OAUTH_CLIENT_ID="your-github-oauth-client-id"
GITHUB_OAUTH_CLIENT_SECRET="your-github-oauth-client-secret"
GOOGLE_OAUTH_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_OAUTH_CLIENT_SECRET="your-google-oauth-client-secret"

# ── FUTURE / OPTIONAL (not required for MVP) ──
# RATE_LIMIT_REDIS_URL="your-edge-kv-or-redis-url"    # dedicated rate limiter at scale
# SENTRY_DSN="your-sentry-dsn"                        # error monitoring
# CRON_SECRET="your-cron-shared-secret"               # authenticate scheduled purge/retention jobs
```

**Specification rules for the file:**
- **Placeholders only** — the committed example never contains a real key.
- **Grouped and commented** by exposure class (public vs. server-only vs. future) so contributors cannot misclassify.
- **Every variable the app requires appears here** — `.env.example` is the authoritative checklist; a required variable missing from it is a documentation bug.
- **Kept in sync with the env-validation schema** in `lib/` — the schema and the example must agree (checked in review).

---

## 5. Handling Across Environments

| Environment | Where values live | Notes |
|-------------|-------------------|-------|
| Local (`.env.local`) | Developer machine only, git-ignored | Not applicable on the restricted machine (no local run); relevant for any future local dev. |
| Preview (per-PR) | Vercel env (Preview scope) | Points at a **non-production** Supabase project/branch to protect real data ([13](13-Git-Strategy.md)). |
| Production (`main`) | Vercel env (Production scope) | Real production Supabase; secrets rotatable without code changes ([10](10-Security-Architecture.md)). |

**Rotation:** any secret can be rotated in Vercel/Supabase and redeployed with no code change. A rotation runbook is a documented operational task.

---

## 6. Why This Approach

- **Prefix-as-policy** makes exposure auditable at a glance and in code review — the cheapest, most reliable guard against leaking a secret to the browser.
- **Startup validation** turns misconfiguration into a fast, visible failure instead of a silent security or runtime bug — essential when the first build/run is on Vercel.
- **`.env.example` as contract** means a new engineer (or the Vercel setup) knows exactly what to provide, with zero risk of committed secrets.
- **Secrets only in Vercel/Supabase** keeps the repository safe to share and consistent with the git strategy.

---

*End of Environment Variables.*
