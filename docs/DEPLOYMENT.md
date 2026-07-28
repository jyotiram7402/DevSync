# Deployment Guide

DevSync deploys to **Vercel** via the **GitHub integration**. Vercel is the first (and authoritative) build environment — there is no local build step in this project's workflow.

---

## Pipeline Overview

```
Developer ──push/PR──▶ GitHub ──▶ Vercel
                                   ├─ installs dependencies
                                   ├─ builds Next.js (type-check + lint + compile)
                                   ├─ PR  → Preview deployment (isolated URL)
                                   └─ main → Production deployment (global edge/CDN)
```

- **Preview:** every pull request gets an isolated preview URL. This is where a change is verified before merge.
- **Production:** merging to `main` deploys to production automatically (continuous deployment).

---

## First-Time Setup

1. **Push the repository to GitHub.**
2. **Import the repo into Vercel** (New Project → import from GitHub). Vercel auto-detects Next.js — no build configuration needed:
   - Build command: `next build` (default)
   - Install command: `npm install` (default)
   - Output: handled by Vercel's Next.js adapter
3. **Set environment variables** in Vercel → Project → Settings → Environment Variables. In the foundation sprint all variables are optional; set `NEXT_PUBLIC_SITE_URL` to the deployed URL for correct metadata. See [`.env.example`](../.env.example) and [`docs/architecture/14-Environment-Variables.md`](architecture/14-Environment-Variables.md).
4. **Deploy.** The first build runs on Vercel.

---

## Environment Variables

| Scope | Variable | Foundation | Notes |
|-------|----------|-----------|-------|
| Public | `NEXT_PUBLIC_SITE_URL` | Optional | Canonical URL for metadata/absolute links. Set per environment. |
| Public | `NEXT_PUBLIC_APP_ENV` | Optional | `development` \| `preview` \| `production`. |
| Public | `NEXT_PUBLIC_SUPABASE_URL` | Later | Added in the auth sprint. |
| Public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Later | Public by design; RLS is the boundary. |
| Server | `SUPABASE_SERVICE_ROLE_KEY` | Later | **Secret.** Server-only; bypasses RLS. Never `NEXT_PUBLIC_`. |

Rules:

- **Never commit secrets.** Only `.env.example` (placeholders) is committed.
- **`NEXT_PUBLIC_` = public.** Anything without that prefix is server-only and must never appear in client code.
- Configure **Preview** and **Production** scopes separately; point Preview at a non-production Supabase environment once the database exists.

---

## Environments

| Environment | Trigger | Data backend |
|-------------|---------|--------------|
| Preview | Pull request | Non-production Supabase (once introduced) |
| Production | Merge to `main` | Production Supabase |

---

## Rollback

Vercel retains immutable deployments. To roll back, promote the previous good deployment from the Vercel dashboard — near-instant, no rebuild. Risky features additionally sit behind flags ([`lib/feature-flags.ts`](../lib/feature-flags.ts)) so they can be disabled without a redeploy.

---

## Build Troubleshooting

If a build fails on Vercel:

1. Open the failed deployment's **Build Logs** in Vercel.
2. Common causes: a TypeScript type error (the build type-checks), an ESLint error, or a missing required env var (in later sprints).
3. Fix on a branch, push, and confirm the **preview build** passes before merging.

Because the project builds on Vercel first, treat a green preview build as the definition of "it compiles."

---

## Security Headers

Baseline security headers ship from [`next.config.ts`](../next.config.ts). A full Content-Security-Policy is introduced with the auth sprint (it requires per-request nonces and a Supabase origin allow-list) — see [`docs/architecture/10-Security-Architecture.md`](architecture/10-Security-Architecture.md).
