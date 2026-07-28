/**
 * SSR-safe, typed wrapper around `localStorage`.
 *
 * Guards every access with an environment check (no-ops on the server) and
 * wraps calls in try/catch so quota errors, disabled storage, or malformed
 * JSON never throw. Values are (de)serialized as JSON. Prefer this over
 * touching `window.localStorage` directly.
 */
const isBrowser = typeof window !== "undefined";

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (!isBrowser) {
      return fallback;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item === null ? fallback : (JSON.parse(item) as T);
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    if (!isBrowser) {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota/serialization errors — storage is best-effort.
    }
  },

  remove(key: string): void {
    if (!isBrowser) {
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore — nothing actionable if removal fails.
    }
  },
};
