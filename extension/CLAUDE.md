# Browser extension (`extension/`)

Chromium Manifest V3 extension for CopyAnywhere: sign in, save the clipboard as a snippet, see and copy recent snippets. It talks to the same Supabase project (and RLS) as the web app. It has never been built.

- Stack: Vite 6 + `@crxjs/vite-plugin` (beta), React 19, TypeScript, Tailwind 3, `webextension-polyfill`, `@supabase/supabase-js` with a `chrome.storage` session adapter. Node 20.x (`package.json` engines).
- Own `package.json` and `tsconfig.json`; not an npm workspace and excluded from the root `tsconfig.json`, so the Vercel build never compiles it.
- Commands (inside `extension/`): `npm install`, `npm run dev`, `npm run build` (`tsc --noEmit && vite build` → `dist/`), `npm run type-check`. Load `dist/` at chrome://extensions → Developer mode → Load unpacked.
- Env: copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Supabase → Project Settings → API) and `VITE_DEVSYNC_URL` (the web app's address). Public values only; never a service-role key.
- Map: `src/background/` (service worker: message router, auth bootstrap, sync alarm), `src/popup/` and `src/options/` (React UIs), `src/content/` (selection bridge, web app origin only), `src/messaging/` (zod-validated message bus), `src/services/`, `src/storage/` (`chrome.storage` wrappers), `src/shared/` (config, Supabase client), `src/hooks/`, `src/utils/`. Manifest and permissions: `manifest.config.ts`.
- Imports root files through `@/*`: `types/database`, `features/snippets/types`, `features/sync/types`, `features/sync/services/realtime-sync-service`, `lib/sync/local-echo`. Changing those in the root can break this package.
- Before shipping: generate the PNG icons (`src/assets/README.md`) and set the content-script `matches` in `manifest.config.ts` to the deployed origin.
- The clipboard is only read on an explicit action in the popup. Required permissions stay minimal (`storage`, `clipboardRead`, `clipboardWrite`, `alarms`, `activeTab`); the rest are optional and requested at runtime.

When you change commands, structure, env vars or conventions, update this file in the same commit.
