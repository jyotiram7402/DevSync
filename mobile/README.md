# DevSync Android App (Expo / React Native)

Another client of the existing DevSync platform — same Supabase backend, RLS,
Realtime, and Storage. **No backend APIs are redesigned and no business logic is
duplicated**: the app reuses the repo's framework-agnostic modules and consumes
the same services the web app and extension do.

> **Isolated from the Next.js build.** Own `package.json` (not a workspace) and
> own `tsconfig`, and listed in the root `tsconfig.json` `exclude`, so Vercel's
> `next build` never compiles it. Build/test happen later off this machine.

## Reuse (via the `@/*` alias → repo root)

- Types: `types/database`, `features/snippets/types`, `features/sync/types`, `features/search/types`
- Snippet queries: `features/snippets/services/snippet-repository`
- Storage: `lib/storage/{buckets,paths,validation,storage}` (upload + validation)
- Sync/realtime primitives: `features/sync/services/realtime-sync-service`, `lib/sync/local-echo`
- Search engine: `features/search/services/{query-builder,search-indexer,search-ranking-service}`

`~/*` resolves the app's own `src/`. Metro watches the repo root (`metro.config.js`)
and Babel rewrites the aliases.

## Architecture

`app/` (Expo Router) — `sign-in`, `(tabs)/` (home, search, devices, settings),
`item/[id]`, `share` (Share Target handler), `upload` (file picker). `src/` —
`lib/` (supabase client + config + query client), `providers/` (Query, Auth,
Theme, SafeArea, Gesture), `services/`, `hooks/`, `stores/` (Zustand: offline
queue + settings), `components/`, `theme/`, `types/`, `utils/`.

## Flows

- **Upload** (text/URL/image/pdf/office/zip/audio/video): `sync-manager.submitUpload` → shared `uploadPending` → snippet row (`snippet-repository`) + `snippet-attachments` object (`lib/storage`) referenced from `metadata`. Offline → persisted queue, flushed on reconnect.
- **Realtime**: `realtime-service` subscribes to the same Supabase Realtime channel using the shared `snippetsChangeFilter`/`normalizeSnippetChange` — React Query invalidates on change. Not a second realtime system.
- **Share Target**: `expo-share-intent` (configured in `app.json`) → `use-share-handler` maps the intent to uploads → shared upload engine.
- **Auth**: Supabase Auth — email/password, magic link, Google/GitHub OAuth (in-app browser + deep link). Session encrypted at rest via `expo-secure-store`; auto-login + refresh on foreground.

## Security & privacy

Anon key only (RLS is the boundary); session encrypted in SecureStore; uploads
validated against bucket rules; workspace-scoped everywhere; **no background
clipboard monitoring** (Android privacy) — paste & sync is foreground, on-action.

## Setup (later, off-machine)

```bash
cd mobile
npm install
cp .env.example .env.local   # EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY / _DEVSYNC_URL
npx expo prebuild            # after adding assets/*.png (see assets/README.md)
npx expo run:android         # or: eas build -p android
```

Configure the app's redirect (`devsync://auth-callback`) as an allowed redirect
URL in Supabase Auth, and set the OAuth providers there.
