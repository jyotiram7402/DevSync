# DevSync — Roadmap, Backlog & Known Issues

Living document. Everything deferred, broken, or planned lives here so it is not
lost between sessions. Ordered by priority within each section.

**Status legend:** 🔴 blocker · 🟠 important · 🟡 nice-to-have · ✅ done

---

## 1. Known bugs & risks

### 🔴 Monaco editor loads from a CDN — breaks on locked-down networks
**Where:** `features/snippets/components/snippet-editor.tsx` (line 3)
**Problem:** `@monaco-editor/react` is only a wrapper; Monaco's ~5 MB of real
files are fetched at runtime from `cdn.jsdelivr.net`. Corporate proxies commonly
block unknown CDNs, so the editor hangs on *"Loading editor…"* and the user
cannot read or edit their snippet.
**Why it matters:** the core product wedge is "works on a restricted work
machine" — this fails on exactly that machine.
**Fix (agreed approach):** add a timeout-based fallback to a plain `<textarea>`
(~5s). Guarantees the editor is always usable. Later optimization: bundle Monaco
locally (`monaco-editor` is already a dependency) — fiddly in Next.js due to web
workers, so do the fallback first.

### 🔴 Zero automated tests (307 source files)
Nothing is verified except what has been clicked manually. Highest-risk untested
code:
1. **Retention job** (`supabase/migrations/…011_retention_policy.sql`) — it
   **permanently deletes data and storage files**, and there are no backups on
   the Supabase free tier.
2. Clipboard Sync Engine (offline queue, conflict resolution, self-echo filter).
3. Upload/attachment flow (`createPendingFileSnippet` → upload → finalize).

### 🟠 No storage quota enforcement
`STORAGE_LIMIT_BYTES` in `features/dashboard/services/overview-service.ts` is a
**display-only** number. Nothing stops one user from consuming the project's
entire 1 GB Supabase storage allowance, which would break uploads for everyone.
Needed before any real users. (Mitigated somewhat by the 7-day retention purge.)

### 🟠 Extension and Android app have never been compiled or run
`extension/` and `mobile/` are production-intent code but **unverified** — no
`npm install`, no build, no device test. Also pending for both:
- Generate PNG icons from `icon.svg` (see each `assets/README.md`).
- Extension: set content-script `matches` to the real deployed origin.
- Mobile: register `devsync://auth-callback` in Supabase Auth redirect URLs.
- Both still have `exactOptionalPropertyTypes: true` in their tsconfigs — they
  will hit the same JSX friction the web app did (root has it disabled now).

### 🟠 Clipboard Sync Engine UI is incomplete
From an interrupted sprint. Missing: `sync-queue-viewer`, `conflict-dialog`,
`reconnect-banner`, `offline-banner`, `sync-progress`, the `features/sync/index.ts`
barrel, plus `SyncProvider` wiring and `markLocalWrite` calls in the snippet
form/actions.

### 🟡 Realtime only auto-refreshes the Home page
`LiveRefresh` is mounted on `/dashboard/home` only. Snippets, Images, Links,
Docs, and Files pages need a manual refresh to show new remote items.

### 🟡 Extension does not stamp `metadata.source`
So items saved from the extension show no "from …" tag in library views and
Recent Sync. One-line fix in the extension's save path.

### 🟡 Pre-existing URL snippets are not classified as links
Links saved before the `createTextCapture` fix have no `metadata.kind: "url"`,
so they remain under Snippets instead of Links. Needs a one-time backfill:
`update snippets set metadata = ... where content ~ '^https?://'`.

### 🟡 `pg_cron` availability assumption
Migration 011 runs `create extension if not exists pg_cron`. If the project/plan
blocks it, retention will not schedule. Fallback: a Vercel Cron route calling the
same two SQL functions.

### 🟡 Library counts derive from a bounded scan
`overview-service` and `listLibraryItems` scan the most recent 1000 / 300 items
and filter in memory. Accurate for a personal workspace; needs real per-kind
count queries + pagination beyond that.

### 🟡 Minor cleanups
- Edit page shows a text editor for file/image snippets (pointless — hide or
  redirect for attachment items).
- `components/dashboard/search-bar.tsx` and `command-palette-trigger.tsx` are
  now unused (replaced by `GlobalSearchBar`).
- `types/database.ts` is hand-authored; must be updated whenever the schema
  changes (Supabase CLI cannot run in this environment).

---

## 2. Product roadmap — ranked by differentiation

Context: the sync/clipboard space is crowded (Apple/Windows clipboard,
Pushbullet, KDE Connect, Telegram-to-self, Cacher, Pieces). The genuine wedge is
**"zero install, works in a browser on a locked-down corporate machine"** —
which eliminates almost every competitor. These features lean into that.

### 🟠 1. Stack-trace / error intelligence ← the differentiator
Parse pasted errors instead of storing them as plain text. Detect error type,
file, and line; auto-title the item.
> `TypeError: Cannot read property 'id' of undefined at getUser (/src/auth/session.ts:42:15)`
> → 🔴 **TypeError** · `auth/session.ts:42` · TypeScript

Enables "show all TypeErrors from last week". Nothing in the clipboard space
does this. Pure parsing (no AI), and `snippets.metadata` already supports it.
**This makes the "Copy Once. Debug Anywhere." tagline true.**

### 🟠 2. Pairing-code sign-in for work machines
Typing a personal password into a monitored work laptop is a real risk. Instead:
phone displays a 6-digit code → enter it on the work machine → short-lived,
**read-only** session. Strong, unique fit for the core use case.

### 🟠 3. Image compression before upload
Shrink to ~1600px / ~80% quality client-side. Typically 60–80% smaller, which
multiplies the free tier's 1 GB storage and 5 GB/month egress. Cheapest big win.

### 🟡 4. "Work machine mode"
Read-only session, auto sign-out, nothing cached in the browser. Pairs with the
existing auto-expiry ("nothing lingers on the work laptop").

### 🟡 5. CLI (`devsync push` / `devsync pull`)
Developers live in terminals; Telegram and Pushbullet cannot compete here.

### 🟡 6. VS Code extension
Capture from where developers actually work.

### 🟡 7. End-to-end encryption
"Your clipboard, unreadable by us" — a real reason to choose this over a
big-tech clipboard.

### 🟡 8. Send-to-device + QR handoff
Push an item to a specific device; scan a QR to open it on a phone.

### 🟡 9. Sync notification toasts
"New item from *Pixel 8*" when something arrives from another device.

### 🟡 10. Custom domain
A neutral developer-tool domain is far less likely to be category-blocked by
corporate IT than a known file-sharing service.

---

## 2b. Installable app (PWA) — in progress

✅ Manifest with PNG icon entries, `share_target` (GET), app shortcuts,
standalone display · service worker (`public/sw.js`, network-first so it can
never serve a stale app) · offline fallback page · SW registration ·
`/dashboard/share` receiver for the Android share sheet.

**🔴 Blocked on you:** add `public/icon-192.png` and `public/icon-512.png`.
Android/Chrome will not show "Install app" without both. Export from
`public/logo.svg` or use realfavicongenerator.net.

**🟡 Deferred — sharing *files* to the app.** The share target currently accepts
**text and links only** (`method: "GET"`). Receiving images/PDFs from the share
sheet needs `method: "POST"` + `multipart/form-data` and a route handler that
reads `formData()`. Files can already be added via Quick add → Attach file.

**🟡 Deferred — "Install app" in-app prompt.** Users must currently use the
browser menu → *Install app / Add to Home Screen*. A `beforeinstallprompt`
button would make this discoverable.

**Not doing yet:** Play Store (TWA/PWABuilder, needs a $25 one-time Google fee).

---

## 2c. Native Android app — decided, in progress

**Decision (2026-07-30):** the user wants a real native app (not a PWA wrapper).
The PWA work stays as the browser experience; native is additive.

**Build pipeline:** `.github/workflows/mobile-build.yml` runs EAS Build in the
cloud (GitHub Actions + Expo servers) so **no local Node/Android toolchain is
needed** — this was the hard blocker given the corporate-machine constraint.
Distribute the resulting APK directly (free); Play Store deferred.

**Pending before the app is usable:**
- 🔴 First build has never run — expect failures like the Vercel loop; fix from
  the Actions logs. (`exactOptionalPropertyTypes` already pre-disabled.)
- 🔴 Fill the real values into `mobile/eas.json` `env` blocks (currently
  `REPLACE-ME`), and add the `EXPO_TOKEN` secret in GitHub.
- 🔴 Generate `mobile/assets/*.png` (icon, adaptive-icon, splash).
- 🟠 **Feature parity gap vs web** — the mobile app is missing: Images/Links/
  Docs/Files library views, attachment/image previews, retention expiry badges,
  and the Recent Sync feed. It has home/search/devices/settings/share/upload.
- 🟠 Register `devsync://auth-callback` in Supabase Auth redirect URLs.
- 🟡 Ongoing cost: two UIs to maintain. Accepted deliberately.

---

## 3. UX & polish backlog

- **Bottom tab bar on mobile web** — biggest "feels native" upgrade (replaces the
  hamburger drawer).
- **PWA install prompt** — "Add to Home Screen" gives a fullscreen, app-like
  launch. Manifest already exists; just needs prompting.
- **Thumbnails on the main Snippets grid** (library rows already have them).
- **Trim the mobile top bar** — collapse the 3-icon theme switcher into the
  avatar menu.
- **Infinite scroll / pagination** on library views.
- **Rich previews** for code and link cards (favicon + title for URLs).

---

## 4. Deferred by design (not started)

Multi-workspace / teams (schema already supports it), public snippet sharing,
version history, AI features, analytics UI, billing, notifications.

---

## 5. Positioning note

Market the legitimate framing — *"your own notes and errors, available on every
device you use"* — **not** "bypass your company's restrictions." The latter reads
as a data-exfiltration tool and invites deliberate IT blocking.
