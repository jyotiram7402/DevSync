import type { ConnectionStatus } from "@ext/types";

/**
 * Connection monitoring. The MV3 service worker is ephemeral and no socket is
 * kept alive here, so connection status is read live from `navigator.onLine`
 * (available in the worker scope). Periodic recovery is handled by the sync
 * alarm, which flushes the offline queue whenever it runs online.
 */
export function getConnection(): ConnectionStatus {
  return typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "online";
}

export function initConnectionMonitor(): void {
  // Reserved: online/offline hooks can be attached here if a future feature
  // needs push-style connectivity reactions. Kept empty to avoid idle listeners.
}
