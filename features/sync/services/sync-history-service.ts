import type { SyncEvent } from "@/features/sync/types";

/**
 * SyncHistoryService — manages the in-memory session history buffer (no DB
 * writes, honoring the "minimize database writes" goal). The provider keeps
 * the buffer; this exposes the pure append/trim logic.
 */
export const MAX_HISTORY = 50;

export function appendHistory(entries: SyncEvent[], event: SyncEvent, max = MAX_HISTORY): SyncEvent[] {
  return [event, ...entries].slice(0, max);
}
