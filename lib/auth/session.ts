import "server-only";

import type { Session } from "@supabase/supabase-js";

import { toAuthUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/types/auth";

/**
 * Server-side session helpers.
 *
 * `getServerUser` authenticates via `getUser()` (which verifies the JWT with
 * Supabase) and is the trustworthy source for server components and guards.
 * Both helpers are guarded so they never throw: unconfigured or a network
 * failure resolves to null.
 */
export async function getServerUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return toAuthUser(data.user);
  } catch {
    return null;
  }
}

/**
 * Returns the raw session (read from cookies, not re-verified). Prefer
 * `getServerUser` for authorization decisions; use this only when the session
 * object itself is needed.
 */
export async function getServerSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}
