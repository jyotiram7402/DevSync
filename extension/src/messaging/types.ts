import type {
  ConnectionStatus,
  SessionMeta,
  SyncState,
  WorkspaceInfo,
} from "@ext/types";

/**
 * Typed messaging contract between popup / options / content scripts and the
 * background service worker (and a future side panel). Every message is a
 * discriminated union member; every response is described by ResponseMap.
 */
export type ExtensionMessage =
  | { type: "PING" }
  | { type: "GET_STATE" }
  | { type: "SIGN_IN"; email: string; password: string }
  | { type: "SIGN_OUT" }
  | { type: "TRIGGER_SYNC" }
  | { type: "SAVE_CLIPBOARD"; content: string; title?: string; language?: string }
  | { type: "SELECTION_CAPTURED"; text: string; url: string }
  | { type: "SETTINGS_CHANGED" };

export type MessageType = ExtensionMessage["type"];

/** Aggregate state the popup renders on open. */
export interface PopupState {
  configured: boolean;
  session: SessionMeta | null;
  workspace: WorkspaceInfo | null;
  connection: ConnectionStatus;
  sync: SyncState;
}

export interface ResponseMap {
  PING: { pong: true; version: string };
  GET_STATE: PopupState;
  SIGN_IN: PopupState;
  SIGN_OUT: { signedOut: true };
  TRIGGER_SYNC: SyncState;
  SAVE_CLIPBOARD: { snippetId: string | null; queued: boolean };
  SELECTION_CAPTURED: { stored: true };
  SETTINGS_CHANGED: { applied: true };
}

export type ResponseFor<T extends MessageType> = ResponseMap[T];

/** Uniform result envelope so callers never deal with thrown errors. */
export type Ok<T> = { ok: true; data: T };
export type Fail = { ok: false; error: string };
export type Result<T> = Ok<T> | Fail;

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}
export function fail(error: string): Fail {
  return { ok: false, error };
}
