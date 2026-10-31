/*
 * CopyAnywhere service worker.
 *
 * Purpose: satisfy the PWA installability requirement (a fetch handler) and
 * show a friendly page when the device has no connection — WITHOUT ever
 * serving a stale app.
 *
 * Strategy, deliberately conservative:
 *   • Immutable build assets (/_next/static/…) → cache-first. Safe because
 *     Next.js fingerprints these filenames; a new build produces new URLs.
 *   • Page loads while the device is online → not touched. The browser loads
 *     them itself, so a network that blocks the site, or any other failure,
 *     shows the browser's own error with the real reason instead of a
 *     misleading "You're offline".
 *   • Page loads while the device is offline → network first, then the
 *     offline page.
 *   • Everything else (Server Actions, Supabase, auth) → network only. Never
 *     touches non-GET requests.
 *
 * Bump VERSION whenever offline.html or the caching here changes: browsers
 * only reinstall the worker when this file changes, and the new version
 * deletes the old caches (including the old saved offline page).
 */
const VERSION = "copyanywhere-v2";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      // "reload" skips the HTTP cache, so the saved offline page is the current one.
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

// Only fingerprinted files: anything else (like /icon.svg) can change under
// the same name, so it must never be cached forever.
function isImmutableAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only ever handle same-origin GETs. Mutations, Supabase, and cross-origin
  // requests pass straight through to the network untouched.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Fingerprinted build output: cache-first (fast, and safe to cache forever).
  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              void caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Page loads: step in only when the device has no connection. Still try the
  // network first, in case the offline flag is out of date.
  if (request.mode === "navigate" && !self.navigator.onLine) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached ?? Response.error()),
      ),
    );
  }
});
