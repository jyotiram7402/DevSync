/*
 * DevSync service worker.
 *
 * Purpose: satisfy the PWA installability requirement (a fetch handler) and
 * provide a graceful offline experience — WITHOUT ever serving a stale app.
 *
 * Strategy, deliberately conservative:
 *   • Immutable build assets (/_next/static/…) → cache-first. Safe because
 *     Next.js fingerprints these filenames; a new build produces new URLs.
 *   • Everything else (pages, Server Actions, Supabase, auth) → network only.
 *     Navigations fall back to a cached shell ONLY when the network fails, so
 *     you always get fresh data when online.
 *   • Never touches non-GET requests (Server Actions / mutations are POSTs).
 */
const VERSION = "devsync-v1";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]))
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

function isImmutableAsset(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname === "/icon.svg";
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

  // Page navigations: always network-first so data is fresh; show the offline
  // page only if the network is genuinely unavailable.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached ?? Response.error()),
      ),
    );
  }
});
