import type { SyncEvent, SyncEventType } from "@/features/sync/types";

/**
 * EventDispatcher — a tiny typed in-memory pub/sub for sync events. Components
 * subscribe via useRealtimeEvents; the sync engine emits.
 */
export type SyncEventListener = (event: SyncEvent) => void;

export class SyncEventDispatcher {
  private readonly listeners = new Set<SyncEventListener>();

  on(listener: SyncEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: SyncEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

let counter = 0;

/** Build a SyncEvent with a stable-ish local id and timestamp. */
export function createSyncEvent(
  type: SyncEventType,
  message: string,
  entityId?: string,
): SyncEvent {
  counter += 1;
  return {
    id: `${Date.now().toString(36)}-${counter}`,
    type,
    at: new Date().toISOString(),
    message,
    ...(entityId ? { entityId } : {}),
  };
}
