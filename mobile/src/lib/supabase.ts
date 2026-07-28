import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

import type { Database } from "@/types/database";
import { CONFIG } from "~/lib/config";
import { secureStorageAdapter } from "~/lib/secure-storage";

/**
 * Supabase client for the Android app — the SAME backend (Auth + Postgres + RLS
 * + Realtime + Storage) as the web app and extension. The session persists in
 * encrypted SecureStore; there is no URL-based session detection on native.
 */
export type MobileSupabaseClient = SupabaseClient<Database>;

export const supabase: MobileSupabaseClient = createClient<Database>(
  CONFIG.supabaseUrl,
  CONFIG.anonKey,
  {
    auth: {
      storage: secureStorageAdapter,
      storageKey: "devsync_auth",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

/**
 * Drive token auto-refresh with app foreground state (recommended for RN):
 * refresh while active, pause in the background to save battery/network.
 */
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    void supabase.auth.startAutoRefresh();
  } else {
    void supabase.auth.stopAutoRefresh();
  }
});
