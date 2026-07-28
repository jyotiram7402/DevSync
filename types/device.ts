/**
 * Device model shared across the client and (future) device services.
 * Mirrors the columns on the `devices` table.
 */
export type ClientType = "web" | "extension" | "vscode" | "cli" | "mobile";

export interface DeviceMetadata {
  deviceId: string;
  name: string;
  os: string | null;
  browser: string | null;
  clientType: ClientType;
  clientVersion: string;
}

/** Payload used to register/update a device row (persistence added later). */
export interface DeviceRegistrationInput {
  name: string;
  os: string | null;
  browser: string | null;
  clientType: ClientType;
  clientVersion: string;
}
