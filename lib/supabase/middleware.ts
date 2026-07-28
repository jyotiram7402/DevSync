import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase auth session for the request and returns both the
 * response (carrying any updated session cookies) and the authenticated user.
 *
 * The root middleware uses the returned `user` to make route-protection
 * decisions. If Supabase is not configured this is a pass-through with a null
 * user, so the app runs with zero configuration.
 *
 * Follows the official Supabase SSR pattern: no logic between client creation
 * and `getUser()`.
 */
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: User | null }> {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    return { response: supabaseResponse, user: null };
  }

  const { url, anonKey } = getSupabaseConfig();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  let user: User | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  return { response: supabaseResponse, user };
}
