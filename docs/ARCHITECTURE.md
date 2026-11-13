# Architecture

Detailed map for CopyAnywhere (repo DevSync). The short version is in `CLAUDE.md`.

## Request and data flow

```
Browser ── HTTPS: RSC pages, Server Actions ──▶ Vercel (Next.js 15)
   │                                               │ createServerSupabaseClient(): cookie session, RLS as the user
   │ WSS: Realtime · HTTPS: Storage uploads        ▼
   └─────────────────────────────────────────▶ Supabase: Postgres + RLS, Auth, Realtime, Storage, pg_cron
```

- `middleware.ts` → `updateSession()` (`lib/supabase/middleware.ts`): refreshes the session cookie on every matched request, sends signed-out users from `PROTECTED_PREFIXES` (`/dashboard`, …) to `/login?next=…`, and signed-in users away from `/login`, `/signup`, `/forgot-password` (lists in `lib/auth/redirect.ts`). The matcher skips `_next/static`, images, `/monaco/` and common asset types.
- `app/layout.tsx`: fonts and `<Providers>` (`providers/index.tsx`: ThemeProvider → SupabaseProvider → AuthProvider → RealtimeProvider, plus Toaster and the PWA install capture).
- `app/dashboard/layout.tsx`: `requireUser()` (redirects when signed out) and the room list, then SearchProvider (⌘K), QuickCaptureProvider, RegisterDevice (device row + 2-minute heartbeat) and `AppShell`.
- Reads: page (Server Component) → `features/*/services/*-service.ts` (`server-only`, returns `ActionResult`) → `*-repository.ts` → Supabase.
- Writes: Client Component → `features/*/actions.ts` (`"use server"`) → service → `revalidatePath()`.
- `createServerSupabaseClient()` is wrapped in React `cache` (one client per request) and shares a single `auth.getUser()` call. `resolveSnippetContext()` (also cached) resolves the user's personal workspace; there is no workspace switching yet, so the role is always `owner`.

## Routes (`app/`)

| Route | Notes |
|---|---|
| `/` | Landing page: `app/page.tsx` + `components/sections/*` (hero with paste demo, inbox, work laptop, kinds, spaces preview, privacy, FAQ, CTA) |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Auth forms in `components/auth/*`; auth calls in `lib/auth/auth.ts` (browser client) |
| `/auth/callback` | `route.ts`: PKCE code exchange for Google/GitHub sign-in (and legacy email links) |
| `/auth/confirm` | Email links land here; a button runs `verifyOtp({ token_hash })` in `actions.ts` |
| `/privacy`, `/terms` | Static pages; contact address from `lib/site-config.ts` |
| `/dashboard` | Redirects to `/dashboard/home` |
| `/dashboard/home` | Latest snippets (`LiveSnippetFeed`), Library counts, notes widget, devices, storage |
| `/dashboard/snippets` (+ `new`, `[snippetId]`, `[snippetId]/edit`) | Text/code items; list is a `LiveSnippetFeed`; editor is Monaco (lazy) with a textarea fallback |
| `/dashboard/library/[type]` (+ `[id]`) | `images`, `links`, `docs`, `files`, grouped by date; `LiveRefresh` |
| `/dashboard/notes` | Quick Notes (`notes` table); `NotesLiveRefresh` |
| `/dashboard/spaces` (+ `[id]`, `join/[[...code]]`) | Shared rooms; `SpaceLiveRefresh` in a room |
| `/dashboard/projects` (+ `new`, `[projectId]`, `[projectId]/edit`), `/dashboard/collections` | Organization |
| `/dashboard/search` | Full search page; ⌘K palette comes from `features/search/search-provider.tsx` |
| `/dashboard/settings`, `/dashboard/profile`, `/dashboard/help`, `/dashboard/billing` | Billing is hidden from the nav |
| `/dashboard/share` | PWA share target (`app/manifest.ts` `share_target`, GET, text and links) |
| `/design-system` | Component showcase; 404 in production |
| `/icon-192.png`, `/icon-512.png` | Route handlers that render the PNG app icons |

## Feature modules (`features/`)

- `snippets` (core): `services/snippet-repository.ts` (all `snippets` queries; explicit column list skips `search_vector`), `snippet-service.ts` (permissions, zod, Quick-add capture, file placeholder/finalize, library listing by `metadata.kind`), `snippet-mapper.ts` (row → `Snippet`), `snippet-context.ts` (cached workspace lookup), `actions.ts`, `live-events.ts` (tells open lists about a save on this device), `components/live-snippet-feed.tsx` (applies realtime rows in place, reconciles with the server 2s later), `snippet-row.tsx`, form/viewer/menu/bulk bar, `hooks/use-snippet-selection.ts` (zustand selection for bulk actions).
- `library`: `config.ts` (which `metadata.kind` values each tab shows), list/grid/add components. Data comes from `listLibraryItems()` in the snippet service.
- `capture`: `quick-capture-provider.tsx` (open state), `quick-capture.tsx` (text → `createTextCaptureAction`; file → `createPendingFileSnippetAction` → browser upload with `uploadFile()` → `finalizeFileSnippetAction`), `share-receiver.tsx` (share-sheet input).
- `notes`: repository/service/mapper, actions, notes widget and live refresh.
- `spaces`: `space-repository.ts` calls RPCs (`create_space`, `join_space_by_code`, `add_space_member_by_email`, `rotate_space_code`, `list_space_members`); service, mapper, room/composer/invite/join components, `space-live-refresh.tsx`.
- `projects`: repository/service/actions/schemas, components and hooks.
- `search`: query builder (FTS vs. ILIKE), filter builder, indexer, ranking, repository, service, suggestions, recent/saved searches (localStorage), ⌘K provider and modal.
- `dashboard`: `services/overview-service.ts` (counts per kind, devices, storage from a 1000-row metadata-only scan), `live-refresh.tsx`, `register-device.tsx`, library strip.
- `settings`: device list and settings sections.
- `sync`: `services/realtime-sync-service.ts` (`normalizeSnippetChange`, `parseSnippetChange`, `readSnippetRow`, `snippetsChangeFilter`; also used by the extension and mobile app), `services/device-service.ts` + `actions.ts` (device register/heartbeat). `sync-provider.tsx`, its hooks and components are never mounted.

## Shared layers

- `lib/supabase/`: `browser.ts` (browser client; realtime heartbeat every 15s in a Web Worker, reconnect backoff 1s→10s), `server.ts` (per-request client), `middleware.ts`, `config.ts` (`isSupabaseConfigured`), `types.ts`.
- `lib/auth/`: `auth.ts` (sign-in/up, magic link, OAuth, reset, update password; maps Supabase error codes to messages), `email-links.ts` (link types, where each lands), `redirect.ts` (route lists, `sanitizeRedirect`, `absoluteUrl`), `guards.ts` (`requireUser`, `requireGuest`), `session.ts` (`getServerUser`).
- `lib/realtime/`: `platform.ts` (RealtimePlatform), `connection.ts` (status; "offline" only after `HEAD /robots.txt` fails too; rechecks every 5s; resume on tab show/online), `channel-manager.ts` (ref-counted channels by name), `subscription-manager.ts`, `presence.ts`, event bus/router/registry and serializer (broadcast envelope, mostly unused), `constants.ts` (timings, backoff), `channels.ts` (`workspace:<id>`, `user:<id>`, `space:<id>` names).
- `lib/storage/`: bucket registry, object paths, validation, `uploadFile()`. `lib/sync/local-echo.ts`: recent-local-write tracker.
- Other `lib/`: `env.ts` (zod-validated public env, all optional), `constants.ts` (`APP_NAME`, `SITE_URL`), `site-config.ts` (nav, footer, support email), `dashboard/navigation.ts`, `item-kinds.ts`, `item-text.ts`, `retention.ts`, `safe-url.ts`, `theme.ts`, `pwa/`, `device/device.ts` (stable device id in localStorage).
- `components/`: `ui/` (primitives), `items/` (ItemRow, ItemPreview, ArrivalFeed: new-item highlight + "N new items" pill), `shared/` (PageHeader, EmptyState, ErrorState, page skeletons), `dashboard/` (AppShell, Sidebar, TopBar, BottomTabBar, Add/More sheets), `auth/`, `sections/`, `pwa/`, `realtime/` (ConnectionBanner and debug widgets), `layout/` (site header/footer).
- `hooks/`: `use-realtime-channel.ts` (acquire/subscribe/release, status callback), `use-live-channel.ts` (adds resync after a reconnect, a tab hidden ≥10s, or the network coming back), `use-supabase.ts`, `use-auth.ts`, `use-presence.ts`, `use-install-prompt.ts`, `use-media-query.ts`, `use-minute-tick.ts` and others.
- `stores/ui-store.ts` (zustand UI state), `types/` (`api.ts` = `ActionResult`, `database.ts` hand-written), `utils/` (`cn`, formatters, dates, storage, validation, errors, announce).

## Database (`supabase/migrations/`)

Workspace-centric: every content row has a `workspace_id`; access goes through `workspace_members` and SECURITY DEFINER helpers (`is_workspace_member`, `has_workspace_role`, `shares_workspace_with`). Signing up runs `handle_new_user` (profile + personal workspace + Inbox). Soft deletes (`deleted_at`), UUID keys, trigger-maintained `updated_at`.

| Migration | Adds |
|---|---|
| `20260723120001` – `…120005` | extensions, core tables (profiles, workspaces, workspace_members, devices, projects, collections, snippets, snippet_collections, sync_events, prompt_history, api_keys, audit_logs), helper functions and triggers, RLS policies, read-only views |
| `…120006`, `…120007` | storage buckets `avatars`, `snippet-attachments`, `workspace-assets`, `exports` and their policies |
| `…120008` | project icon, color, favorite/pin/archive columns |
| `…120009` | `snippets` in the `supabase_realtime` publication, `replica identity full` (events carry whole rows) |
| `…120010` | `pg_trgm` and trigram indexes for search |
| `…120011` | retention: `devsync_retention_days()` = 7; pg_cron soft-deletes old unpinned, unfavorited items, then purges them 7 days later |
| `…120012` | `notes` table (+ realtime) |
| `20260826120000_spaces` | `spaces`, `space_members`, `space_items` (+ realtime), `space-attachments` bucket, room functions |
| `20260924120000_spaces_project_rooms` | permanent rooms, add member by email, member list |
| `20261028120000_security_hardening` | retention functions locked from clients, 10-character room codes, wrong-code and invite throttling (`space_rate_events`), uniform invite answer, `rotate_space_code`. A wrong code now returns an empty row, not an error |

## Realtime

- One `RealtimePlatform` per browser client (`providers/realtime-provider.tsx`), which also keeps the socket's auth token current.
- Live components subscribe through `useLiveChannel` with a unique channel name per mount (a shared name made a page pick up the previous page's closing channel and miss updates):
  - `LiveSnippetFeed` (Home, Snippets): applies INSERT/UPDATE/DELETE rows that match the page's filters and sort; page 1 only; then `router.refresh()` after 2s of quiet.
  - `LiveRefresh` (Library), `NotesLiveRefresh`, `SpaceLiveRefresh`: `router.refresh()` 150ms after a change.
  - All of them catch up after a reconnect, a return to the tab, or the network coming back, because events sent while disconnected are lost.
- Echo of this device's own writes: `markLocalWrite()` / `isRecentLocalWrite()` in `lib/sync/local-echo.ts`.

## Auth

- Browser-side calls in `lib/auth/auth.ts`, so `onAuthStateChange` in `providers/auth-provider.tsx` updates the UI at once.
- Google/GitHub: `signInWithOAuth` → provider → `/auth/callback?next=…` (code exchange; only works in the same browser).
- Email links (sign-up, magic link, reset, email change, invite): Supabase templates point to `/auth/confirm?token_hash=…&type=…`; the page shows a button and `confirmEmailLink` verifies on the server, so links work in any browser and scanners can't use them up. Reset links continue to `/reset-password` (`updateUser({ password })`).
- Auth emails are sent by Supabase through custom SMTP (Gmail); setup in `docs/setup/supabase-gmail-smtp.md`.

## PWA

- `app/manifest.ts` (standalone display, icons, shortcuts, `share_target` → `/dashboard/share`).
- `public/sw.js`: cache-first for `/_next/static/`; page loads are left to the browser unless the device is offline, then `offline.html`. Bump `VERSION` when either changes.
- Install prompts: `components/pwa/*`, `lib/pwa/*`, `hooks/use-install-prompt.ts`.

## Other packages

- `extension/` (Chromium MV3, Vite + `@crxjs/vite-plugin`, React 19): background service worker, popup, options page, minimal content script. See `extension/CLAUDE.md`.
- `mobile/` (Expo SDK 52, Expo Router, React Native 0.76): sign-in, home, search, devices, settings, item detail, share-into-app, upload, offline queue. See `mobile/CLAUDE.md`.
- Both import root modules through the `@/*` alias and are excluded from the root `tsconfig.json`, so the Vercel build never checks them.
