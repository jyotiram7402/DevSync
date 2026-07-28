import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { EXTENSION_CONFIG } from "@ext/shared/config";
import { browser } from "@ext/utils/browser";

/**
 * Supabase client for the extension — the SAME backend (Auth + Postgres + RLS +
 * Realtime) the web app uses. It does NOT reuse the app's @supabase/ssr
 * cookie client (there are no shared cookies across extension contexts).
 * Instead it persists the session in chrome.storage.local via a custom adapter,
 * so popup, background, and content scripts share one authenticated session.
 * Only the session token is stored — never a long-lived secret.
 */
export type ExtensionSupabaseClient = SupabaseClient<Database>;

const AUTH_STORAGE_KEY = "devsync.auth.session";

const chromeStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    const result = await browser.storage.local.get(key);
    const value = result[key];
    return typeof value === "string" ? value : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    await browser.storage.local.set({ [key]: value });
  },
  async removeItem(key: string): Promise<void> {
    await browser.storage.local.remove(key);
  },
};

let cached: ExtensionSupabaseClient | null = null;

export function getSupabaseClient(): ExtensionSupabaseClient {
  if (cached) return cached;
  cached = createClient<Database>(
    EXTENSION_CONFIG.supabaseUrl,
    EXTENSION_CONFIG.supabaseAnonKey,
    {
      auth: {
        storage: chromeStorageAdapter,
        storageKey: AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      realtime: { params: { eventsPerSecond: 5 } },
    },
  );
  return cached;
}
