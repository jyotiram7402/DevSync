"use client";

import { useSync } from "@/features/sync/hooks/use-sync";
import type { SyncStatus } from "@/features/sync/types";

export interface ClipboardSyncApi {
  status: SyncStatus;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  /** Capture the current clipboard and sync it (or queue it while offline). */
  sync: () => Promise<void>;
}

/**
 * Manual + status view of clipboard synchronization. Automatic sync (reacting
 * to remote changes) runs inside the provider; this exposes the on-demand path.
 */
export function useClipboardSync(): ClipboardSyncApi {
  const { status, lastSyncedAt, syncClipboard } = useSync();
  return {
    status,
    isSyncing: status === "syncing",
    lastSyncedAt,
    sync: syncClipboard,
  };
}
