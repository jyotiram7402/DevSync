/**
 * ConflictResolver — conflict handling strategy for the sync engine.
 *
 * STRATEGY (documented):
 *   • Last-Write-Wins (default): when two devices change the same entity, the
 *     change with the later `updatedAt` wins. Server timestamps (DB-maintained
 *     via triggers) make the ordering authoritative and explainable.
 *   • Timestamp comparison: `isRemoteNewer` decides whether an incoming remote
 *     change supersedes the local view.
 *   • Duplicate detection: realtime can deliver an event more than once; a
 *     seen-set keyed by id + commit timestamp makes application idempotent.
 *   • Self-event filtering: a device ignores the echo of its own writes (see
 *     lib/sync/local-echo) — required because a user's devices share identity.
 *   • Retry after reconnect: handled by the offline queue.
 *
 * FUTURE: pluggable policies (merge, manual-resolve, field-level, CRDT) can be
 * introduced behind `ConflictStrategy` without changing call sites.
 */
export type ConflictStrategy = "last-write-wins";

export interface Versioned {
  updatedAt: string;
}

export function isRemoteNewer(remoteUpdatedAt: string, localUpdatedAt: string): boolean {
  return new Date(remoteUpdatedAt).getTime() > new Date(localUpdatedAt).getTime();
}

export function resolveLastWriteWins<T extends Versioned>(local: T, remote: T): T {
  return isRemoteNewer(remote.updatedAt, local.updatedAt) ? remote : local;
}

/** Returns true if the key was already seen (a duplicate); records it otherwise. */
export function isDuplicate(seen: Set<string>, key: string): boolean {
  if (seen.has(key)) return true;
  seen.add(key);
  return false;
}

export function isSelfEvent(eventDeviceId: string | null, myDeviceId: string): boolean {
  return eventDeviceId !== null && eventDeviceId === myDeviceId;
}
