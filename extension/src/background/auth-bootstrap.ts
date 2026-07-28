import { getSessionMeta, onAuthChange } from "@ext/services/auth-service";
import { STORAGE_KEYS } from "@ext/storage/keys";
import { removeStored } from "@ext/storage/storage";

/**
 * Authentication bootstrap. supabase-js restores + refreshes the session from
 * chrome.storage automatically; this ensures it's loaded on worker start and
 * clears cached UI state on sign-out so nothing stale leaks between accounts.
 */
export async function bootstrapAuth(): Promise<void> {
  await getSessionMeta(); // touch: triggers session restore + refresh

  onAuthChange((meta) => {
    if (!meta) {
      void removeStored(STORAGE_KEYS.recentSnippets);
      void removeStored(STORAGE_KEYS.lastSelection);
      void removeStored(STORAGE_KEYS.offlineQueue);
    }
  });
}
