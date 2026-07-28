/** Extension-wide constants (pure values). */
export const EXTENSION_VERSION = "0.1.0";

export const RECENT_SNIPPETS_LIMIT = 15;

/** Mirrors the snippets.content DB constraint. */
export const MAX_CLIPBOARD_LENGTH = 100_000;

/** chrome.alarms names (periodic work without keeping the SW alive). */
export const ALARMS = {
  sync: "devsync:sync",
  connection: "devsync:connection",
} as const;

export const SYNC_INTERVAL_MINUTES = 5;
export const CONNECTION_INTERVAL_MINUTES = 1;

export const DASHBOARD_PATHS = {
  root: "/dashboard",
  snippets: "/dashboard/snippets",
  search: "/dashboard/search",
  settings: "/dashboard/settings",
  login: "/login",
} as const;
