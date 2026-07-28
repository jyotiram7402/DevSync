import type { SyncStatus } from "@/features/sync/types";

/** Re-exported shared domain types (single source of truth). */
export type { Snippet, SnippetVisibility } from "@/features/snippets/types";
export type { SyncStatus } from "@/features/sync/types";

export type ThemePreference = "system" | "light" | "dark";

export type ContentKind = "text" | "url" | "image" | "pdf" | "office" | "archive" | "audio" | "video" | "file";

export interface WorkspaceInfo {
  id: string;
  name: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  os: string | null;
  browser: string | null;
  clientType: string;
  lastSeenAt: string | null;
  online: boolean;
}

/** A lean snippet row rendered in lists. */
export interface RecentItem {
  id: string;
  title: string;
  preview: string;
  language: string | null;
  kind: ContentKind;
  pinned: boolean;
  favorite: boolean;
  updatedAt: string;
}

/** A file/text selected or received to upload. */
export interface PendingUpload {
  uri: string | null;
  text: string | null;
  name: string;
  mimeType: string;
  size: number;
  kind: ContentKind;
}

/** An operation queued while offline, retried on reconnect. */
export interface QueueItem {
  id: string;
  upload: PendingUpload;
  attempts: number;
  createdAt: string;
}

export interface Settings {
  theme: ThemePreference;
  autoSyncClipboard: boolean;
  compressImages: boolean;
  wifiOnlyUploads: boolean;
  telemetry: boolean;
  developerMode: boolean;
  activeWorkspaceId: string | null;
}

export interface SyncSnapshot {
  status: SyncStatus;
  lastSyncedAt: string | null;
  pending: number;
}
