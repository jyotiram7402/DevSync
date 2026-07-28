# DevSync Browser Extension (Manifest V3)

A Chromium MV3 extension that reuses the DevSync backend (Supabase Auth +
Postgres + RLS + Realtime) and the app's shared, framework-agnostic sync
primitives. **No backend logic is duplicated** — the extension is a thin client
over the same APIs the web app uses.

> This package is **isolated from the Next.js app build**. It has its own
> `package.json`, `tsconfig.json`, and Vite build, and is listed in the root
> `tsconfig.json` `exclude` so `next build` on Vercel never compiles it.

## Architecture

| Module | Responsibility |
|---|---|
| `background/` | Service worker: message routing, auth bootstrap, sync alarm, connection monitoring |
| `popup/` | React popup: workspace, sync status, recent snippets, copy, manual sync, sign in/out |
| `options/` | React options page: theme, workspace, sync/clipboard/privacy prefs, version |
| `content/` | Minimal, DevSync-origin-scoped selection bridge (no page business logic) |
| `messaging/` | Typed, Zod-validated message bus (popup/content ↔ background ↔ future side panel) |
| `services/` | auth, workspace, snippet, sync, realtime, clipboard (over supabase-js) |
| `storage/` | Typed `chrome.storage.local` wrappers + settings |
| `shared/` | Config, constants, and the Supabase client (chrome.storage session adapter) |
| `hooks/`, `types/`, `utils/`, `assets/` | React hooks, extension types, helpers, icons |

## Reuse of existing infrastructure

Imported from the main repo via the `@/*` alias (all pure / framework-agnostic):
`types/database`, `features/snippets/types`, `features/sync/types`,
`features/sync/services/realtime-sync-service` (`normalizeSnippetChange`,
`snippetsChangeFilter`), and `lib/sync/local-echo` (`markLocalWrite`). Auth,
snippets, and realtime all run against the same Supabase project and RLS.

## Setup & build (performed later, off the corporate machine)

```bash
cd extension
npm install
cp .env.example .env.local   # fill VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_DEVSYNC_URL
npm run build                # tsc --noEmit && vite build  → dist/
```

Then load `extension/dist` via `chrome://extensions` → Developer mode → **Load
unpacked**. Before packaging, generate the PNG icons (see `src/assets/README.md`)
and set the content-script `matches` in `manifest.config.ts` to your deployed
web origin.

## Permissions (least privilege)

`storage`, `clipboardRead`, `clipboardWrite`, `alarms`, `activeTab` are required;
`scripting`, `contextMenus`, `notifications` and the Supabase/web hosts are
**optional** and requested at runtime. Rationale is documented inline in
`manifest.config.ts`.

## Security

MV3 default CSP (no inline scripts, no `eval`); the anon key is the only public
value shipped (RLS is the boundary — no secrets); every inbound message is
schema-validated and unknown types are rejected; clipboard access only happens
on explicit user action in the popup.

## Firefox (later, minimal delta)

All runtime code uses the `webextension-polyfill` `browser.*` promise API. The
only expected changes are the manifest background form (`background.scripts` /
event page) and `browser_specific_settings.gecko`.
