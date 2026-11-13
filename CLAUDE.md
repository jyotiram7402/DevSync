# CopyAnywhere (repo: DevSync)

## Overview
- CopyAnywhere is a cross-device clipboard: save text, code, errors, links, images or files on one device and copy them on another about a second later. Also: Library (images, links, docs, files), Quick Notes, Projects, Search and Spaces (shared rooms for a small team).
- For people with several devices, especially developers on locked-down work laptops: it's a web app and installable PWA, so nothing has to be installed. That is its edge over Apple/Windows clipboard sync, Pushbullet and similar tools.
- Solo project; GitHub `jyotiram7402/DevSync` is public. Repo and package keep the old name DevSync (`devsync`); the product name is `APP_NAME` in `lib/constants.ts`.

## Tech stack
- Next.js 15.2.8 (App Router, Server Components, Server Actions), React 19.0.0, TypeScript 5.7 `strict` + `noUncheckedIndexedAccess` (`exactOptionalPropertyTypes` is off; README.md is outdated there).
- Supabase: Postgres + RLS, Auth, Realtime (`postgres_changes`), Storage, pg_cron. `@supabase/ssr` 0.5 (cookie sessions) + `@supabase/supabase-js` 2.x.
- Tailwind 3.4 + tailwindcss-animate; tokens are CSS variables in `styles/globals.css`, mapped in `tailwind.config.ts`. Radix Slot + CVA, lucide-react 0.469, sonner, next-themes; fonts via `next/font` (IBM Plex Sans, JetBrains Mono).
- react-hook-form + zod 3, zustand 5, monaco-editor 0.52 (self-hosted copy).
- Node 24.x (`package.json` engines, `.nvmrc`), npm + `package-lock.json`, ESLint 9 flat config, Prettier 3. No test framework and no tests.
- Separate packages, not npm workspaces: `extension/` (Chromium MV3, Vite) and `mobile/` (Expo SDK 52, React Native 0.76). Each has its own CLAUDE.md.

## Setup on a fresh machine
1. Install Node 24 (`nvm install 24 && nvm use`) and git, clone, then `npm install` (postinstall copies Monaco into `public/monaco/`, which is git-ignored).
2. `cp .env.example .env.local`; fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase → Project Settings → API (the same values are in Vercel → Project → Settings → Environment Variables). Keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
3. `npm run dev` → http://localhost:3000. Without Supabase values the pages render, but sign-in and data say "not configured".
4. Email links and Google/GitHub sign-in on localhost need `http://localhost:3000/**` in Supabase → Authentication → URL Configuration → Redirect URLs.
- New Supabase project: run every `supabase/migrations/*.sql` in filename order in the SQL editor, then set Auth providers, Site URL, Redirect URLs, custom SMTP and email templates (`docs/setup/supabase-gmail-smtp.md`).
- The owner's old work laptop could not run npm, node or any CLI, so Vercel's build was the first compile and fixes came from pasted Vercel logs. Whether the current machine can run them: (unverified) ask the owner before running anything.

## Commands
| Task | Command |
|---|---|
| Install | `npm install` |
| Dev server | `npm run dev` |
| Production build / serve | `npm run build` / `npm run start` |
| Type-check (this is what fails a Vercel build) | `npm run type-check` |
| Lint / auto-fix | `npm run lint` / `npm run lint:fix` |
| Format / check | `npm run format` / `npm run format:check` |
| Tests (all / single) | none: there is no test runner and no test file |
| DB migration | add `supabase/migrations/<YYYYMMDDHHMMSS>_<name>.sql`; the owner runs it in Supabase → SQL Editor (no Supabase CLI, no migration history table) |
| Deploy | branch → PR into `main` → merge. Vercel deploys `main` to production and every branch to a preview that needs a Vercel login |
| Extension | `cd extension && npm install && npm run build`, then load `extension/dist` unpacked |
| Android app | GitHub Actions → "Build Android app (EAS)" (`.github/workflows/mobile-build.yml`) |

## Project map
The full module map, data model, realtime and auth design are in docs/ARCHITECTURE.md; read it before changing data flow, realtime, auth or the database.
- `app/`: landing `/` (sections in `components/sections/`), `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback` (OAuth code exchange), `/auth/confirm` (email links), `/privacy`, `/terms`. The app is `/dashboard/*` (`app/dashboard/layout.tsx` = `requireUser()` + `AppShell`): home, snippets, library/[type], notes, spaces, projects, collections, search, settings, share (PWA share target), billing (not in the nav). `/design-system` returns 404 in production.
- `features/<name>/`: `services/<name>-repository.ts` (Supabase queries, throws), `services/<name>-service.ts` (`import "server-only"`, returns `ActionResult`), `actions.ts` (`"use server"`), `schemas.ts` (zod), `types.ts`, `components/`, `index.ts`. Modules: snippets (the core items), library, capture (Quick add), notes, spaces, projects, search, dashboard, settings, sync.
- `components/`: `ui/` primitives, `items/` (ItemRow, ItemPreview, ArrivalFeed), `shared/`, `dashboard/` (shell, sidebar, top bar, bottom tab bar), `auth/`, `sections/`, `pwa/`, `realtime/`.
- `lib/`: `supabase/` (browser, server and middleware clients), `auth/` (auth calls, guards, redirect rules, email links), `realtime/` (RealtimePlatform), `storage/`, `dashboard/navigation.ts`, `retention.ts`, `item-kinds.ts`, `site-config.ts`, `env.ts`.
- `providers/index.tsx` nests Theme → Supabase → Auth → Realtime and is mounted in `app/layout.tsx`. `middleware.ts` refreshes the session cookie and guards `/dashboard`.
- `supabase/migrations/`: 16 files (schema, RLS, functions, storage, cron, realtime). `types/database.ts` is the hand-written DB type.
- `public/`: `sw.js` (service worker), `offline.html`, `realtime-worker.js` (realtime heartbeat); `monaco/` is generated.
- Flow: page (Server Component) → service → repository → Supabase as the signed-in user (RLS). Mutations: client → Server Action → service → `revalidatePath`. Live: Supabase Realtime → `hooks/use-live-channel.ts` → `LiveSnippetFeed` (applies rows in place) or `LiveRefresh` (`router.refresh()`). Files: browser uploads to Storage, then a Server Action finalizes the row.

## Where to start for common tasks
- New dashboard page: `app/dashboard/<name>/page.tsx` (Server Component) + `loading.tsx` from `components/shared/page-skeletons.tsx`; nav entry in `lib/dashboard/navigation.ts`. Follow `app/dashboard/snippets/page.tsx`.
- New query or mutation: repository function → service function → action. Follow `features/snippets/services/snippet-repository.ts`, `snippet-service.ts` and `features/snippets/actions.ts`.
- Schema change: new migration with tables, RLS and grants together (idempotent where possible), then update `types/database.ts` by hand; add the table to the `supabase_realtime` publication if lists must be live (see `20260723120009_enable_snippets_realtime.sql`).
- Live list: rows applied in place → `features/snippets/components/live-snippet-feed.tsx`; server re-render → `features/dashboard/components/live-refresh.tsx`. Both use `hooks/use-live-channel.ts`.
- UI: primitives in `components/ui/*`, item rows in `components/items/*`; a new color means a new token in `styles/globals.css` + `tailwind.config.ts`.
- Auth and email links: `lib/auth/auth.ts` (browser auth calls + Supabase error-code messages), `app/auth/confirm/*`, `app/auth/callback/route.ts`, `middleware.ts`, `lib/auth/redirect.ts`.
- Landing page: `app/page.tsx` + `components/sections/*`. Site links and the support email: `lib/site-config.ts`.

## Conventions
- Server Components by default; `"use client"` only on interactive leaves. Never pass functions or component references (e.g. lucide icons) from a Server to a Client Component.
- Services catch errors and return `ActionResult` (`ok()`/`err()` in `types/api.ts`); repositories throw. Log error codes only, never item content.
- Always use `createServerSupabaseClient()` (`lib/supabase/server.ts`): one client per request, sharing one `auth.getUser()`. The workspace is the user's personal one (`resolveSnippetContext` in `features/snippets/services/snippet-context.ts`); the role is always `owner` today.
- Semantic tokens only (`background`, `surface`, `foreground`, `muted-foreground`, `primary`, `primary-ink`, `wash`, `border`, `input`, `destructive`, `success`, `warning`, `kind-*`, `project-*`); no raw colors or Tailwind palette classes.
- Mobile-first: check 320/390/768/1440 px in light and dark; `dvh` not `vh`; `min-w-0` on flex/grid children holding user content; `[overflow-wrap:anywhere]` or `truncate` on user text; 44px touch targets (`pointer-coarse:`); `text-base md:text-sm` inputs; safe areas on fixed elements; no hover-only actions; never hide horizontal overflow, fix its cause.
- Reuse `components/ui/*` (Button, IconButton, Input, PasswordInput, Textarea, Select, Checkbox, Switch, SegmentedControl, ScrollableTabs, ResponsiveDialog/ConfirmDialog, Menu, CopyButton, CodeBlock, Badge, KindBadge/KindIcon, FileIcon, RelativeTime, Skeleton, Progress, Avatar), `components/items/*` and `components/shared/*`; no one-off variants. Dialogs go through ResponsiveDialog; destructive actions confirm with ConfirmDialog.
- Every list has skeleton, empty (inviting the action) and error (with Try again) states; every route has a `loading.tsx`.
- Icon buttons have `aria-label` (IconButton requires `label`); decorative icons are `aria-hidden`. Motion only when something happens, and respect reduced motion.
- Copy copies the raw text exactly and saved text is never trimmed (only a lone URL is tidied).
- UI copy: sentence case, short plain English, "Copy" → "Copied", "Save", "Delete …"; never "sprint", "upcoming" or "coming soon".
- Lookups keyed by user input use `Map` or `Object.hasOwn`, never a plain object. Browser-only checks use `useSyncExternalStore` with a null server snapshot.
- Realtime: every mounted live component gets its own channel name (`…:feed-<random>`); handlers live in refs.
- Privacy: no analytics or third-party scripts at runtime, no clipboard content in URLs.
- Git: one branch per change (`fix/…`, `docs/…`), Conventional Commits (`fix(sync): …`, `ui(…): …`), PR into `main`. The owner pushes and merges. No AI attribution anywhere: no `Co-Authored-By` or "Generated with" lines, no AI wording in files.

## Env variables & external services
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase → Project Settings → API. Public by design (RLS is the boundary); required for auth and data.
- `NEXT_PUBLIC_SITE_URL`: canonical origin for metadata (`SITE_URL` in `lib/constants.ts`) and server-built absolute URLs (`getBaseUrl()` in `lib/auth/redirect.ts`; in the browser the page's own origin is used). Set per Vercel environment.
- `NEXT_PUBLIC_APP_ENV`: `development` | `preview` | `production` label.
- `NEXT_PUBLIC_REALTIME_DEBUG`: `1` turns on realtime logs and the connection debug panel in production (the panel always shows in development). Optional.
- `VERCEL_ENV`, `NODE_ENV`: set by Vercel and Next; never set them by hand.
- Reserved, read nowhere yet: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` (commented in `.env.example`). The service key must never get a `NEXT_PUBLIC_` name.
- Extension: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEVSYNC_URL`. Mobile: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_DEVSYNC_URL` (also placeholders in `mobile/eas.json`). GitHub Actions secret: `EXPO_TOKEN` (expo.dev → Access Tokens).
- Supabase: Postgres, Auth (email + password, magic link, Google, GitHub), Realtime on `snippets`, `notes`, `space_items`, `space_members`, Storage buckets `snippet-attachments`, `space-attachments`, `avatars`, `workspace-assets`, `exports`, and pg_cron jobs for retention.
- Vercel hosts the app: project `dev-sync`, team `hrubisoftmayurisaxena-7244s-projects` (from preview URLs). Production URL: (unverified). Env values live in Vercel, never in git.
- Auth emails go through Gmail SMTP set as custom SMTP in Supabase (`docs/setup/supabase-gmail-smtp.md`); the app password is typed into Supabase only.
- Expo EAS builds the Android app in the cloud.

## Gotchas
- Vercel's build stops at the first TypeScript error; lint never blocks it (`eslint.ignoreDuringBuilds` in `next.config.ts`).
- `extension/` and `mobile/` are excluded from the root `tsconfig.json` but import root files through `@/*` (`types/database`, `features/snippets/services/snippet-repository`, `features/sync/services/realtime-sync-service`, `features/search/services/*`, `lib/sync/local-echo`, `lib/storage/*`, `utils/formatters`). Changing those can break the other packages, and nothing compiles them.
- `types/database.ts` is maintained by hand; update it with every schema change.
- Migrations run by hand, so nothing records which ones ran. Order can matter: `20261028120000_security_hardening.sql` had to run right after its code went live (the owner reported it done on 2026-10-29).
- `public/sw.js`: bump `VERSION` whenever `offline.html` or the caching changes, or browsers keep the old copy. It only answers page loads while the device is offline.
- Monaco must stay self-hosted (`scripts/copy-monaco.mjs`, run by postinstall/dev/build) because office firewalls block CDNs; the middleware matcher must keep skipping `/monaco/`.
- Supabase email templates should link to `{{ .SiteURL }}/auth/confirm?token_hash=…&type=…`. `/auth/confirm` verifies only on a button press so mail scanners can't use links up; never verify on page load.
- `lib/supabase/server.ts` wraps `auth.getUser` to share one call per request; keep that if you edit it.
- Quick add text does not `revalidatePath`: open lists update through `announceSavedSnippet` (`features/snippets/live-events.ts`) and realtime.
- `next.config.ts` CSP has `form-action 'self'`: forms can't post to other origins.
- Retention is 7 days in two places: `lib/retention.ts` and `public.devsync_retention_days()` (`20260723120011_retention_policy.sql`). Pinned and favorited items are kept.
- README.md, `features/README.md` and `services/README.md` describe the early scaffold ("Foundation", data access in `services/`); real data access is `features/*/services/`.
- Root `.gitignore` keeps `.claude/`, `AGENTS.md`, `CLAUDE.local.md` and most of `docs/` out of git; only `docs/ARCHITECTURE.md`, `docs/setup/` and the already tracked docs are committed.

## Current status
- `main` has the UI overhaul (PR #3), the offline-page fix (PR #4) and the live-sync fix (PR #5); nothing is in progress.
- Known bug (reported 2026-11-03): "Forgot password" links say "expired" as soon as they're clicked. Likely the Supabase "Reset password" template still uses `{{ .ConfirmationURL }}`, or a work mail scanner opens the link first (unverified). Fix: switch the templates as in `docs/setup/supabase-gmail-smtp.md`, Part 4.
- Possible slowness: Vercel functions may run far from the Supabase region (unverified); fix with `regions` in a `vercel.json`.
- `TODO(owner)` in `lib/site-config.ts`: `SUPPORT_EMAIL` is `support@copyanywhere.com`, a domain the owner doesn't own, yet Privacy, Terms, the footer and Settings → Delete account use it; `GITHUB_URL` is empty.
- Needs backend work: account deletion (also required by app stores), device sign-out, Trash, creating Collections, search counts, Spaces list aggregates, and keeping the query string when a signed-out share redirects to login.
- `features/sync/sync-provider.tsx` and its hooks are never mounted (dead code; ask before deleting).
- `extension/` and `mobile/` have never been built. Before Google Play the app needs a current Expo SDK (target Android 16 is required since 2026-08-31), the CopyAnywhere name and app id, icons and account deletion.
- No tests at all. The living backlog is `docs/ROADMAP.md`: read it before planning and update it when something is deferred or finished.

When you change commands, structure, env vars or conventions, update this file in the same commit.
