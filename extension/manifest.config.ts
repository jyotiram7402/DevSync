import { defineManifest } from "@crxjs/vite-plugin";

/**
 * DevSync — Manifest V3 (Chromium).
 *
 * PERMISSION RATIONALE (least privilege — every entry is justified):
 *   • storage          — extension settings, cached session metadata, offline
 *                         queue metadata, and recent UI state (chrome.storage).
 *   • clipboardWrite   — "Copy" action writes a snippet back to the clipboard.
 *   • clipboardRead    — "Save clipboard as snippet" reads current clipboard
 *                         content (only on explicit user action in the popup).
 *   • alarms           — schedule lightweight periodic sync / connection checks
 *                         instead of keeping the service worker alive.
 *   • activeTab        — capture the current selection on user action without a
 *                         broad host grant.
 *
 * OPTIONAL (requested at runtime, only when the user opts into the feature):
 *   • scripting        — inject on-demand selection capture into the active tab.
 *   • contextMenus     — future right-click "Save selection to DevSync".
 *   • notifications    — future sync notifications.
 *
 * FIREFOX NOTE: Firefox MV3 uses `background.scripts` (or an event page) rather
 * than a module service worker, and `browser_specific_settings.gecko`. Those
 * are the only manifest deltas; all runtime code uses the webextension-polyfill
 * `browser.*` promise API, so the port is minimal.
 *
 * HOST NOTE: the Supabase project origin (REST + Realtime WebSocket) and the
 * DevSync web origin (for the content bridge) are environment-specific. They
 * are declared as OPTIONAL host permissions and requested at runtime, and the
 * content-script match list must be set to the deployed web origin at packaging.
 */
export default defineManifest({
  manifest_version: 3,
  name: "DevSync — Copy Once. Debug Anywhere.",
  version: "0.1.0",
  description:
    "Save your clipboard as snippets and sync errors, logs, and code across your devices.",
  minimum_chrome_version: "116",

  action: {
    default_popup: "src/popup/index.html",
    default_title: "DevSync",
  },

  options_page: "src/options/index.html",

  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },

  content_scripts: [
    {
      // Scoped to the DevSync web origin only (auth/session bridge + selection
      // capture on our own app). Replace with the deployed origin at packaging;
      // arbitrary-page capture is handled on-demand via activeTab + scripting.
      matches: ["http://localhost:3000/*", "https://devsync.app/*"],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
    },
  ],

  permissions: ["storage", "clipboardWrite", "clipboardRead", "alarms", "activeTab"],

  optional_permissions: ["scripting", "contextMenus", "notifications"],

  optional_host_permissions: ["https://*.supabase.co/*", "https://*/*"],

  icons: {
    16: "src/assets/icon-16.png",
    32: "src/assets/icon-32.png",
    48: "src/assets/icon-48.png",
    128: "src/assets/icon-128.png",
  },

  // No inline scripts / no eval — CSP left at the strict MV3 default.
});
