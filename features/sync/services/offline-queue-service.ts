import type { SyncQueueItem } from "@/features/sync/types";
import { storage } from "@/utils/storage";

/**
 * OfflineQueueService — persists outgoing operations that could not be sent
 * (offline) so they can be retried on reconnect. Backed by SSR-safe
 * localStorage; entries survive reloads.
 */
const QUEUE_KEY = "devsync:sync-queue";
const MAX_ATTEMPTS = 5;

export const offlineQueue = {
  list(): SyncQueueItem[] {
    return storage.get<SyncQueueItem[]>(QUEUE_KEY, []);
  },

  enqueue(item: Omit<SyncQueueItem, "id" | "attempts" | "createdAt">): SyncQueueItem[] {
    const entry: SyncQueueItem = {
      ...item,
      id: `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      attempts: 0,
      createdAt: new Date().toISOString(),
    };
    const next = [...offlineQueue.list(), entry];
    storage.set(QUEUE_KEY, next);
    return next;
  },

  remove(id: string): SyncQueueItem[] {
    const next = offlineQueue.list().filter((item) => item.id !== id);
    storage.set(QUEUE_KEY, next);
    return next;
  },

  recordAttempt(id: string): SyncQueueItem[] {
    const next = offlineQueue
      .list()
      .map((item) => (item.id === id ? { ...item, attempts: item.attempts + 1 } : item))
      .filter((item) => item.attempts <= MAX_ATTEMPTS);
    storage.set(QUEUE_KEY, next);
    return next;
  },

  clear(): void {
    storage.remove(QUEUE_KEY);
  },
};
