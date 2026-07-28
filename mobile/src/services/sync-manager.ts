import { useQueueStore } from "~/stores/queue-store";
import type { PendingUpload } from "~/types";
import { uploadPending } from "~/services/upload-service";

/**
 * Sync manager — the single entry point the UI uses to persist content. It
 * decides online-vs-queued, delegates the actual create/upload to the shared
 * upload engine, and flushes the offline queue on reconnect. There is one sync
 * path (this one) — no parallel synchronization.
 */
export interface SubmitResult {
  snippetId: string | null;
  queued: boolean;
}

export async function submitUpload(
  workspaceId: string,
  item: PendingUpload,
  online: boolean,
): Promise<SubmitResult> {
  if (!online) {
    useQueueStore.getState().enqueue(item);
    return { snippetId: null, queued: true };
  }
  try {
    const snippetId = await uploadPending(workspaceId, item);
    return { snippetId, queued: false };
  } catch (error) {
    useQueueStore.getState().enqueue(item);
    throw error;
  }
}

/** Flush queued uploads. Safe to call repeatedly (e.g. on reconnect). */
export async function flushQueue(workspaceId: string): Promise<void> {
  const { items, remove, recordAttempt } = useQueueStore.getState();
  for (const entry of items) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await uploadPending(workspaceId, entry.upload);
      remove(entry.id);
    } catch {
      recordAttempt(entry.id);
    }
  }
}
