import { env } from "@/lib/env";
import { SupabaseConfigError } from "@/utils/errors";

/**
 * Supabase configuration.
 *
 * Centralizes the public Supabase connection values (URL + anon key), sourced
 * from the validated env loader. In this foundation both are optional so the
 * app deploys with zero configuration; consumers that actually need a client
 * assert presence via `getSupabaseConfig()` and fail fast with a clear error.
 *
 * The anon key is intentionally public — it is NOT a security boundary.
 * Row-Level Security is. The service-role key is a server-only concern and is
 * introduced with the admin/database sprint, not here.
 */
export const isSupabaseConfigured: boolean = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export function getSupabaseConfig(): { url: string; anonKey: string } {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new SupabaseConfigError(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return { url: env.supabaseUrl, anonKey: env.supabaseAnonKey };
}
