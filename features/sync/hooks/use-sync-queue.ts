"use client";

import { useSync } from "@/features/sync/hooks/use-sync";
import type { SyncQueueItem } from "@/features/sync/types";

export interface SyncQueueApi {
  items: SyncQueueItem[];
  count: number;
  hasPending: boolean;
  /** Retry every queued operation now. */
  retry: () => Promise<void>;
}

/** Read + retry the offline sync queue. */
export function useSyncQueue(): SyncQueueApi {
  const { queue, flushQueue } = useSync();
  return {
    items: queue,
    count: queue.length,
    hasPending: queue.length > 0,
    retry: flushQueue,
  };
}
