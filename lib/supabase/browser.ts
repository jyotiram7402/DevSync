import { createBrowserClient } from "@supabase/ssr";

import { REALTIME_BACKOFF, REALTIME_TIMING } from "@/lib/realtime/constants";
import { computeBackoff } from "@/lib/realtime/retry";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Database } from "@/types/database";

/** Our own copy of the heartbeat worker (public/realtime-worker.js); nothing is loaded from Supabase's CDN. */
const REALTIME_WORKER_URL = "/realtime-worker.js";

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
  // `@supabase/ssr` and `@supabase/supabase-js` resolve slightly different
  // SupabaseClient generic signatures, so the returned client type does not
  // structurally equal `SupabaseClient<Database>`. The runtime client is
  // correct and bound to Database; normalize the type at this single seam.
  return createBrowserClient<Database>(url, anonKey, {
    realtime: {
      heartbeatIntervalMs: REALTIME_TIMING.heartbeatIntervalMs,
      reconnectAfterMs: (tries: number) =>
        computeBackoff(tries - 1, { baseMs: REALTIME_BACKOFF.baseMs, maxMs: REALTIME_BACKOFF.maxMs }),
      // Heartbeats run in a Web Worker: a background tab's timers are slowed
      // down, which let the connection drop and miss updates until a reload.
      worker: true,
      workerUrl: REALTIME_WORKER_URL,
    },
  }) as unknown as TypedSupabaseClient;
}
