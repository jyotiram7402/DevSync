import { createSnippet } from "@ext/services/snippet-service";
import { getActiveWorkspace } from "@ext/services/workspace-service";
import { STORAGE_KEYS } from "@ext/storage/keys";
import { getStored, setStored } from "@ext/storage/storage";
import type { SyncState } from "@ext/types";
import { markLocalWrite } from "@/lib/sync/local-echo";

/**
 * Synchronization — consumes the SAME backend + shared sync primitives as the
 * web Clipboard Sync Engine (createSnippet through RLS, `markLocalWrite` from
 * lib/sync/local-echo for self-echo filtering). It adds only an extension-local
 * offline queue (chrome.storage) so saves made offline retry on reconnect.
 * There is NO parallel sync algorithm here.
 */
interface QueueItem {
  id: string;
  content: string;
  title?: string;
  language?: string;
  attempts: number;
  createdAt: string;
}

const MAX_ATTEMPTS = 5;

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

async function listQueue(): Promise<QueueItem[]> {
  return getStored<QueueItem[]>(STORAGE_KEYS.offlineQueue, []);
}

async function saveQueue(items: QueueItem[]): Promise<void> {
  await setStored(STORAGE_KEYS.offlineQueue, items);
}

function toQueueItem(input: { content: string; title?: string; language?: string }): QueueItem {
  return {
    id: `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    content: input.content,
    attempts: 0,
    createdAt: new Date().toISOString(),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.language !== undefined ? { language: input.language } : {}),
  };
}

function toCreateInput(
  workspaceId: string,
  item: { content: string; title?: string; language?: string },
): Parameters<typeof createSnippet>[0] {
  return {
    workspaceId,
    content: item.content,
    ...(item.title !== undefined ? { title: item.title } : {}),
    ...(item.language !== undefined ? { language: item.language } : {}),
  };
}

export interface SaveResult {
  snippetId: string | null;
  queued: boolean;
}

export async function saveClipboardSnippet(input: {
  content: string;
  title?: string;
  language?: string;
}): Promise<SaveResult> {
  const workspace = await getActiveWorkspace();
  if (!workspace) throw new Error("No active workspace.");

  if (isOffline()) {
    await saveQueue([...(await listQueue()), toQueueItem(input)]);
    return { snippetId: null, queued: true };
  }

  try {
    const id = await createSnippet(toCreateInput(workspace.id, input));
    markLocalWrite(id);
    return { snippetId: id, queued: false };
  } catch (error) {
    await saveQueue([...(await listQueue()), toQueueItem(input)]);
    throw error;
  }
}

/** Flush the offline queue; returns the resulting sync state. */
export async function triggerSync(): Promise<SyncState> {
  if (isOffline()) return { status: "offline", lastSyncedAt: null };

  const workspace = await getActiveWorkspace();
  if (!workspace) return { status: "error", lastSyncedAt: null };

  const queue = await listQueue();
  const remaining: QueueItem[] = [];

  for (const item of queue) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const id = await createSnippet(toCreateInput(workspace.id, item));
      markLocalWrite(id);
    } catch {
      if (item.attempts + 1 < MAX_ATTEMPTS) {
        remaining.push({ ...item, attempts: item.attempts + 1 });
      }
    }
  }

  await saveQueue(remaining);
  return {
    status: remaining.length > 0 ? "error" : "synced",
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function pendingCount(): Promise<number> {
  return (await listQueue()).length;
}
