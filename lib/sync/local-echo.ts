/**
 * Recent local-write tracker (shared infrastructure).
 *
 * When a device performs a mutation, it records the entity id here. The sync
 * engine consults this to filter out the realtime "echo" of its own writes
 * (self-event filtering) — important because a user's own devices share the
 * same auth identity, so RLS/postgres_changes cannot distinguish them. Purely
 * in-memory with a short TTL; safe on the server (no-op via Date only).
 */
const WINDOW_MS = 6000;
const recent = new Map<string, number>();

export function markLocalWrite(id: string): void {
  recent.set(id, Date.now());
}

export function isRecentLocalWrite(id: string): boolean {
  const at = recent.get(id);
  if (at === undefined) return false;
  if (Date.now() - at > WINDOW_MS) {
    recent.delete(id);
    return false;
  }
  return true;
}
