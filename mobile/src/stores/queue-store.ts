import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { QUEUE_MAX_ATTEMPTS } from "~/lib/constants";
import type { PendingUpload, QueueItem } from "~/types";

/**
 * Offline upload queue (persisted to AsyncStorage — non-sensitive metadata
 * only). Items are enqueued when offline or on failure and flushed by the sync
 * manager on reconnect; items exceeding max attempts are dropped.
 */
interface QueueState {
  items: QueueItem[];
  enqueue: (upload: PendingUpload) => void;
  remove: (id: string) => void;
  recordAttempt: (id: string) => void;
  clear: () => void;
}

function makeId(): string {
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set) => ({
      items: [],
      enqueue: (upload) =>
        set((state) => ({
          items: [
            ...state.items,
            { id: makeId(), upload, attempts: 0, createdAt: new Date().toISOString() },
          ],
        })),
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      recordAttempt: (id) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.id === id ? { ...item, attempts: item.attempts + 1 } : item))
            .filter((item) => item.attempts <= QUEUE_MAX_ATTEMPTS),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "devsync-queue", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
