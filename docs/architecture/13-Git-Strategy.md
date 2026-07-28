# 13 — Git Strategy

**Version:** 1.0 · **Last updated:** 2026-07-22

This document defines branching, commit conventions, pull-request rules, releases, and versioning. It is tuned to DevSync's realities: a **small team**, **continuous deployment via GitHub → Vercel**, and the **no-local-build constraint** (Vercel is the first compiler, so CI checks and preview builds are the safety net).

> The developer pushes to GitHub manually; git is not run on the restricted machine. This document defines the *conventions* the repository and any contributor tooling follow — not commands to execute here.

---

## 1. Branching Strategy — Trunk-Based with Short-Lived Branches

DevSync uses **trunk-based development**: a single always-deployable `main` branch, with short-lived feature branches merged via PR.

```
main  ───────●────────●────────●────────●──────▶  (always deployable → production)
              \        \        /        /
   feat/snippet-copy    \  feat/device-revoke
                     fix/realtime-reconnect
```

- **`main`** — the trunk; always green, always deployable. Every merge triggers a Vercel production deploy.
- **Feature/fix branches** — short-lived (ideally < a few days), branched from `main`, named by type:
  - `feat/<short-desc>` — new capability
  - `fix/<short-desc>` — bug fix
  - `chore/<short-desc>` — tooling/deps/docs infra
  - `docs/<short-desc>` — documentation
  - `refactor/<short-desc>` — non-behavioral change
- **No long-lived develop/release branches.** They add merge overhead and drift; unnecessary for CD to Vercel.

**Why trunk-based (not Git Flow):**
- Matches **continuous deployment** — small, frequent, reversible merges to `main` deploy immediately.
- **Short-lived branches** minimize merge conflicts and integration risk — important when the first real build is on Vercel (small diffs are easier to debug from build logs).
- Simpler for a small team; less ceremony, faster flow.

**Feature flags** ([roadmap-risky work]): anything that could destabilize the core loop merges behind a flag rather than living on a long branch — keeps `main` deployable while work is incomplete.

---

## 2. Commit Convention — Conventional Commits

All commits follow **Conventional Commits**:

```
<type>(<optional scope>): <short imperative summary>

<optional body: what & why, not how>

<optional footer: BREAKING CHANGE, references>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`, `style`, `build`, `ci`.

**Examples:**
```
feat(snippets): add one-click copy with clipboard fallback
fix(realtime): reconcile against source of truth on reconnect
docs(architecture): add realtime scaling section
perf(stream): virtualize snippet list for large histories
```

**Rules:**
- **Imperative mood** ("add", not "added"/"adds").
- **Scope** = the feature/area (`snippets`, `auth`, `realtime`, `db`), matching feature folders ([02](02-Folder-Structure.md)).
- **Body explains why** when non-obvious ([12](12-Coding-Standards.md) comment philosophy).
- `BREAKING CHANGE:` footer for anything that breaks a contract (drives versioning, §5).

**Why:** machine-readable history enables **automated changelogs and semantic versioning**, and keeps the log a genuine narrative of *why* the product evolved.

---

## 3. Pull Request Rules

Every change reaches `main` through a PR. No direct pushes to `main` (branch protection).

**PR must:**
1. **Be small and focused** — one logical change; easier to review and to debug from Vercel build logs.
2. **Pass all CI checks** (required, blocking):
   - Type-check (`tsc` no-emit), **ESLint**, **Prettier** check ([12](12-Coding-Standards.md)).
   - Tests (unit/integration; the sync + RLS suites are critical).
   - **Vercel preview build succeeds** — this is our substitute for local builds; a PR that doesn't build on Vercel cannot merge.
3. **Have a green Vercel preview deployment** — reviewers verify behavior on the live preview URL (crucial since reviewers also can't build locally).
4. **Include a filled PR template:** what changed, why, how it was verified (preview URL + which flows), risk/rollback notes, and linked issue.
5. **Get ≥1 approving review** (2 for security-sensitive areas: auth, RLS, realtime, share links).
6. **Update docs** when architecture/decisions change (ADR or doc edit).

**Review focus areas** (a checklist for reviewers):
- Server/client boundary correctness (build-risk hotspot).
- RLS/authorization implications ([10](10-Security-Architecture.md)).
- Sync correctness (idempotency, reconciliation) for anything touching realtime/cache ([07](07-Realtime-Architecture.md)).
- No secrets/sensitive content in code, logs, or client bundles.
- Bundle-size / performance regressions ([11](11-Performance-Strategy.md)).

**Merge method:** **squash-merge** — one clean, conventional commit per PR on `main`. Keeps history linear and changelog-friendly.

---

## 4. Release Strategy

- **Continuous deployment:** merge to `main` → Vercel builds and deploys to **production** automatically. Small, frequent, reversible releases (PRD release cadence).
- **Preview deployments:** every PR gets an isolated preview URL for verification before merge.
- **Environments:**
  - **Preview** (per-PR) — validates the build and behavior; points at a **non-production Supabase environment/branch** to protect real data.
  - **Production** (`main`) — live app on production Supabase.
- **Rollback:** because releases are small and Vercel retains immutable deployments, rollback = promote the previous good deployment (near-instant). Feature flags allow disabling a feature without a redeploy.
- **Release notes:** generated from Conventional Commits per meaningful release/tag.
- **Database migrations** ([06](06-Database-Strategy.md)) are applied in a controlled, forward-compatible way and coordinated with deploys (expand-then-contract for breaking schema changes) so a rollback of app code doesn't break against the DB.

---

## 5. Versioning — Semantic Versioning

The product follows **SemVer** (`MAJOR.MINOR.PATCH`), aligned to the roadmap:

- **MAJOR** — breaking changes (e.g., a public-API break at v3, `BREAKING CHANGE` commits).
- **MINOR** — new backward-compatible features (roadmap phases: v1.1, v2 features).
- **PATCH** — backward-compatible fixes.

**Mapping to the product roadmap:**
- MVP → `1.0.0` at public launch.
- Sharing/notifications → `1.1.0`.
- Collections/extension/analytics → `2.0.0` line.
- Teams/API → `3.0.0` line.

**Automation:** Conventional Commits drive automated version bumps and changelog generation (`feat` → minor, `fix` → patch, `BREAKING CHANGE` → major). Internal (non-public-API) changes don't require wire versioning ([08](08-API-Strategy.md) §6); SemVer here describes the *product*, and — when the public API ships — its **URL versioning** is tracked separately.

---

## 6. Repository Hygiene

- **`.gitignore`** excludes build output, dependencies, and **all env files except `.env.example`** ([14](14-Environment-Variables.md)) — secrets never enter git.
- **Branch protection on `main`:** required checks, required review, no force-push, linear history.
- **CODEOWNERS** routes reviews for sensitive areas (auth, RLS, realtime) to the right reviewers.
- **Docs live in-repo** (`docs/`) so architecture and code evolve together; significant decisions recorded as ADRs.
- **Migrations in `supabase/`** are versioned and reviewed like code.

---

## 7. Why This Strategy Fits the Environment Constraint

- **Vercel preview builds are the required gate** — they replace the missing local build; nothing merges that hasn't compiled on Vercel.
- **Small, squash-merged PRs** make first-build failures easy to localize from build logs.
- **CI runs type-check/lint/tests** (not the local machine), so quality gates don't depend on local tooling.
- **Feature flags + trunk-based** keep `main` deployable without long branches drifting from a build environment no one can run locally.

---

*End of Git Strategy.*
