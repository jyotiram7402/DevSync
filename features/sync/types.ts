/**
 * Clipboard sync engine — shared types.
 */
export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

export type SyncEventType =
  | "clipboard.copied"
  | "snippet.created"
  | "snippet.updated"
  | "snippet.deleted"
  | "sync.started"
  | "sync.completed"
  | "sync.failed"
  | "conflict.detected"
  | "device.connected"
  | "device.disconnected"
  | "heartbeat.received";

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  at: string;
  message: string;
  entityId?: string;
}

export type SyncChangeAction = "create" | "update" | "delete";

/** A device currently present on the workspace channel (live presence). */
export interface DevicePresence {
  deviceId: string;
  userId: string;
  name: string;
  os: string | null;
  browser: string | null;
  onlineAt: string;
  /** Index signature keeps this compatible with the Realtime presence generic. */
  [key: string]: unknown;
}

/** An operation queued while offline, to be retried on reconnect. */
export interface SyncQueueItem {
  id: string;
  kind: "create-snippet";
  payload: {
    content: string;
    title?: string;
    language?: string;
  };
  attempts: number;
  createdAt: string;
}
