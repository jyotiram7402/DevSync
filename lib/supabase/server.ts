import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

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
 * One client per request (React's `cache`), shared by the layout, the page and
 * every service they call. `auth.getUser()` — a network call to Supabase Auth —
 * is answered once per request as well; a page render used to make it four or
 * five times over.
 *
 * The `setAll` writes are wrapped in try/catch because Server Components have
 * read-only cookies; the middleware is responsible for persisting refreshed
 * session cookies, so failures to write here are expected and safe to ignore.
 */
export const createServerSupabaseClient = cache(async (): Promise<TypedSupabaseClient> => {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  const client = createServerClient<Database>(url, anonKey, {
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

  shareGetUser(client);
  return client;
});

/** Every `auth.getUser()` on this client (without an explicit token) shares one request. */
function shareGetUser(client: TypedSupabaseClient): void {
  const auth = client.auth;
  const getUser = auth.getUser.bind(auth);
  let pending: ReturnType<typeof getUser> | null = null;

  auth.getUser = (jwt?: string) => {
    if (jwt !== undefined) return getUser(jwt);
    pending ??= getUser();
    return pending;
  };
}
