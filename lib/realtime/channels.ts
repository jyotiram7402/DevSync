/**
 * Channel naming convention.
 *
 * Channels are namespaced `<scope>:<id>` so access can be reasoned about and
 * (later) authorized per workspace/user. Builders validate the id to avoid
 * malformed channel names. Pure and dependency-free.
 */
export const CHANNEL_SCOPES = {
  workspace: "workspace",
  presence: "presence",
  user: "user",
  device: "device",
} as const;

export type ChannelScope = (typeof CHANNEL_SCOPES)[keyof typeof CHANNEL_SCOPES];

function assertId(id: string): string {
  const trimmed = id.trim();
  if (trimmed.length === 0) {
    throw new Error("Channel id must be a non-empty string.");
  }
  return trimmed;
}

function build(scope: ChannelScope, id: string): string {
  return `${scope}:${assertId(id)}`;
}

/** Realtime feed for everything within a workspace. */
export function workspaceChannel(workspaceId: string): string {
  return build(CHANNEL_SCOPES.workspace, workspaceId);
}

/** Presence channel for members active in a workspace. */
export function presenceChannel(workspaceId: string): string {
  return build(CHANNEL_SCOPES.presence, workspaceId);
}

/** Per-user channel (cross-device personal events). */
export function userChannel(userId: string): string {
  return build(CHANNEL_SCOPES.user, userId);
}

/** Per-device channel. */
export function deviceChannel(deviceId: string): string {
  return build(CHANNEL_SCOPES.device, deviceId);
}

/** Parse a channel name back into its scope and id, if well-formed. */
export function parseChannel(name: string): { scope: string; id: string } | null {
  const index = name.indexOf(":");
  if (index <= 0 || index === name.length - 1) return null;
  return { scope: name.slice(0, index), id: name.slice(index + 1) };
}
