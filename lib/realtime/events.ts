/**
 * Type-safe realtime event definitions (for future use).
 *
 * These describe the shape of broadcast events the app will exchange over
 * realtime channels. They are DEFINITIONS only — no business logic, no
 * dispatching. Payloads carry identifiers, never full records, so consumers
 * fetch authoritative state (RLS-scoped) rather than trusting broadcast data.
 */
export const REALTIME_EVENTS = {
  snippetCreated: "snippet.created",
  snippetUpdated: "snippet.updated",
  snippetDeleted: "snippet.deleted",
  clipboardChanged: "clipboard.changed",
  deviceConnected: "device.connected",
  deviceDisconnected: "device.disconnected",
  workspaceUpdated: "workspace.updated",
  userPresenceChanged: "user.presence.changed",
} as const;

export type RealtimeEventName = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export interface RealtimeEventPayloads {
  "snippet.created": { snippetId: string; workspaceId: string; actorId: string | null };
  "snippet.updated": { snippetId: string; workspaceId: string; actorId: string | null };
  "snippet.deleted": { snippetId: string; workspaceId: string; actorId: string | null };
  "clipboard.changed": { workspaceId: string; deviceId: string; contentHash: string };
  "device.connected": { deviceId: string; userId: string };
  "device.disconnected": { deviceId: string; userId: string };
  "workspace.updated": { workspaceId: string };
  "user.presence.changed": {
    workspaceId: string;
    userId: string;
    status: "online" | "offline";
  };
}

/** A fully-typed realtime event: the name determines the payload shape. */
export type RealtimeEvent = {
  [K in RealtimeEventName]: { name: K; payload: RealtimeEventPayloads[K] };
}[RealtimeEventName];

/** Type-safe constructor for a realtime event. */
export function createRealtimeEvent<K extends RealtimeEventName>(
  name: K,
  payload: RealtimeEventPayloads[K],
): { name: K; payload: RealtimeEventPayloads[K] } {
  return { name, payload };
}
