import { getConnection } from "@ext/background/connection-monitor";
import { scheduleAlarms } from "@ext/background/sync-trigger";
import { registerHandlers } from "@ext/messaging/bus";
import type { PopupState } from "@ext/messaging/types";
import * as auth from "@ext/services/auth-service";
import { saveClipboardSnippet, triggerSync } from "@ext/services/sync-service";
import { getActiveWorkspace } from "@ext/services/workspace-service";
import { isConfigured } from "@ext/shared/config";
import { EXTENSION_VERSION } from "@ext/shared/constants";
import { STORAGE_KEYS } from "@ext/storage/keys";
import { getStored, setStored } from "@ext/storage/storage";
import type { SyncState } from "@ext/types";

/**
 * Central message router — the single authority the popup/content talk to.
 * Routing auth + sync + state through here (rather than each surface acting
 * independently) is what prevents parallel sync paths and keeps one source of
 * truth. Every handler returns typed data; the bus wraps it in a Result.
 */
const DEFAULT_SYNC: SyncState = { status: "idle", lastSyncedAt: null };

async function getSyncState(): Promise<SyncState> {
  return getStored<SyncState>(STORAGE_KEYS.uiState, DEFAULT_SYNC);
}

async function setSyncState(state: SyncState): Promise<void> {
  await setStored(STORAGE_KEYS.uiState, state);
}

async function buildState(): Promise<PopupState> {
  const session = await auth.getSessionMeta();
  const workspace = session ? await getActiveWorkspace() : null;
  return {
    configured: isConfigured(),
    session,
    workspace,
    connection: getConnection(),
    sync: await getSyncState(),
  };
}

export function initMessageRouter(): void {
  registerHandlers({
    PING: async () => ({ pong: true, version: EXTENSION_VERSION }),

    GET_STATE: async () => buildState(),

    SIGN_IN: async (message) => {
      await auth.signInWithPassword(message.email, message.password);
      return buildState();
    },

    SIGN_OUT: async () => {
      await auth.signOut();
      return { signedOut: true };
    },

    TRIGGER_SYNC: async () => {
      const state = await triggerSync();
      await setSyncState(state);
      return state;
    },

    SAVE_CLIPBOARD: async (message) => {
      const result = await saveClipboardSnippet({
        content: message.content,
        ...(message.title !== undefined ? { title: message.title } : {}),
        ...(message.language !== undefined ? { language: message.language } : {}),
      });
      await setSyncState({
        status: result.queued ? "offline" : "synced",
        lastSyncedAt: new Date().toISOString(),
      });
      return result;
    },

    SELECTION_CAPTURED: async (message) => {
      await setStored(STORAGE_KEYS.lastSelection, {
        text: message.text,
        url: message.url,
        at: new Date().toISOString(),
      });
      return { stored: true };
    },

    SETTINGS_CHANGED: async () => {
      await scheduleAlarms();
      return { applied: true };
    },
  });
}
