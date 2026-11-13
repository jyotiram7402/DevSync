# Android app (`mobile/`)

Expo / React Native client for CopyAnywhere: sign in, home, search, devices, settings, item detail, share into the app, upload, offline queue. Same Supabase backend and RLS as the web app. It has never been built or run.

- Stack: Expo SDK 52, Expo Router 4, React Native 0.76 (new architecture on), React 18.3, TanStack Query 5, zustand 5, react-hook-form + zod, `@supabase/supabase-js` with the session in `expo-secure-store`, `expo-share-intent`.
- Own `package.json` and `tsconfig.json`; excluded from the root `tsconfig.json`. `metro.config.js` watches the repo root and Babel maps `@/*` → repo root and `~/*` → `mobile/src`.
- Commands (inside `mobile/`): `npm install`, `npm run start` (Expo dev server), `npm run type-check`. Cloud build: GitHub Actions → "Build Android app (EAS)" (`.github/workflows/mobile-build.yml`; manual, or on pushes to `main` that touch `mobile/**`; needs the `EXPO_TOKEN` repo secret), or `npx eas build -p android --profile preview`.
- Env: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_DEVSYNC_URL` (`.env.example`). For EAS builds the `env` blocks in `eas.json` still say `REPLACE-ME`.
- Map: `app/` (Expo Router: `sign-in`, `(tabs)/` home/search/devices/settings, `item/[id]`, `share`, `upload`), `src/services/` (auth, snippets, upload, realtime, devices, search, clipboard, sync manager), `src/stores/` (offline queue, settings), `src/hooks/`, `src/components/`, `src/lib/` (Supabase client, config).
- Imports root files through `@/*`: `types/database`, `features/snippets/services/snippet-repository`, `features/snippets/types`, `features/sync/types`, `features/sync/services/realtime-sync-service`, `features/search/services/*`, `features/search/types`, `lib/storage/paths`, `lib/storage/storage`, `lib/sync/local-echo`, `utils/formatters`. Changing those in the root can break this app.
- `app.json`: name "DevSync", package `app.devsync.mobile`, scheme `devsync`; the OAuth redirect `devsync://auth-callback` must be listed in Supabase Redirect URLs. Rename to CopyAnywhere and choose the final package id before the first Play Store upload; it can't change afterwards.
- Missing before release: `assets/*.png` (only `assets/icon.svg` exists), real env values, a current Expo SDK (Google Play has required target Android 16 for new apps since 2026-08-31; SDK 52 targets an older version), in-app account deletion, and an iOS section in `app.json`.
- No background clipboard reading (Android forbids it): copy and paste happen in the foreground, on a user action.

When you change commands, structure, env vars or conventions, update this file in the same commit.
