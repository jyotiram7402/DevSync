import { createBrowserClient } from "@supabase/ssr";

import { computeBackoff } from "@/lib/realtime/retry";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Database } from "@/types/database";

/**
 * Browser Supabase client factory.
 *
 * For use in Client Components (via SupabaseProvider / useSupabase). The
 * browser client manages the auth session through document cookies. It is
 * instantiated once per provider mount; do not call this repeatedly in render.
 *
 * Throws SupabaseConfigError if Supabase env is not configured — callers that
 * may run without configuration must guard with `isSupabaseConfigured`.
 */
export function createBrowserSupabaseClient(): TypedSupabaseClient {
  const { url, anonKey } = getSupabaseConfig();

  // Configure the realtime transport's heartbeat and reconnect strategy
  // (exponential backoff with jitter). Channel-level lifecycle is managed by
  // the RealtimePlatform; this governs the underlying socket.
  return createBrowserClient<Database>(url, anonKey, {
    realtime: {
      heartbeatIntervalMs: 25000,
      reconnectAfterMs: (tries: number) => computeBackoff(tries - 1, { baseMs: 1000, maxMs: 30000 }),
    },
  });
}
