import type { SyncStatus } from "@/features/sync/types";

/**
 * Extension domain types. Backend/domain types are reused from the main repo
 * (e.g. Snippet, SyncStatus); these describe extension-local UI/state shapes.
 */
export type { SyncStatus } from "@/features/sync/types";
export type { Snippet, SnippetVisibility } from "@/features/snippets/types";

export type Theme = "system" | "light" | "dark";

export interface ExtensionSettings {
  theme: Theme;
  /** Attempt clipboard capture on demand (where the browser permits). */
  captureClipboard: boolean;
  /** Run periodic background sync via alarms. */
  autoSync: boolean;
  /** Show sync notifications (requires the optional notifications permission). */
  showNotifications: boolean;
  /** Privacy scaffold — opt-in anonymous telemetry (not yet collected). */
  telemetry: boolean;
  /** Active workspace override (defaults to the personal workspace). */
  activeWorkspaceId: string | null;
}

/** Non-sensitive session metadata cached for fast popup startup. */
export interface SessionMeta {
  userId: string;
  email: string | null;
  displayName: string | null;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
}

/** Lean snippet shape rendered in the popup list. */
export interface RecentSnippet {
  id: string;
  title: string;
  language: string | null;
  preview: string;
  pinned: boolean;
  favorite: boolean;
  updatedAt: string;
}

export type ConnectionStatus = "online" | "offline";

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
}
