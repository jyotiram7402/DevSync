import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig } from "@/lib/supabase/config";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Database } from "@/types/database";

/**
 * Server Supabase client factory.
 *
 * For use in Server Components, Server Actions, and Route Handlers. Reads the
 * session from the request cookies (async in Next.js 15) and honors Row-Level
 * Security as the signed-in user. `import "server-only"` guarantees this module
 * can never be pulled into a client bundle.
 *
 * The `setAll` writes are wrapped in try/catch because Server Components have
 * read-only cookies; the middleware is responsible for persisting refreshed
 * session cookies, so failures to write here are expected and safe to ignore.
 */
export async function createServerSupabaseClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component (read-only cookies). The middleware
          // refreshes the session, so this can be safely ignored.
        }
      },
    },
  }) as unknown as TypedSupabaseClient;
}
