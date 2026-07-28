/** Namespaced chrome.storage.local keys (no secrets are ever stored here). */
export const STORAGE_KEYS = {
  settings: "devsync.settings",
  sessionMeta: "devsync.session.meta",
  recentSnippets: "devsync.cache.recent",
  offlineQueue: "devsync.sync.queue",
  lastSelection: "devsync.ui.selection",
  uiState: "devsync.ui.state",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
