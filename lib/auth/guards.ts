import "server-only";

import { redirect } from "next/navigation";

import { DEFAULT_AUTHENTICATED_REDIRECT, LOGIN_ROUTE } from "@/lib/auth/redirect";
import { getServerUser } from "@/lib/auth/session";
import type { AuthUser } from "@/types/auth";

/**
 * Server-side route guards for use in Server Components / protected layouts.
 *
 * `requireUser` returns the authenticated user or redirects to login (carrying
 * an optional `next`). `requireGuest` redirects authenticated users away from
 * guest-only pages. These complement the middleware (belt and suspenders); RLS
 * remains the authoritative data boundary.
 */
export async function requireUser(next?: string): Promise<AuthUser> {
  const user = await getServerUser();
  if (!user) {
    redirect(next ? `${LOGIN_ROUTE}?next=${encodeURIComponent(next)}` : LOGIN_ROUTE);
  }
  return user;
}

export async function requireGuest(): Promise<void> {
  const user = await getServerUser();
  if (user) {
    redirect(DEFAULT_AUTHENTICATED_REDIRECT);
  }
}
