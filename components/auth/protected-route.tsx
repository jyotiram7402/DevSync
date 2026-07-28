import type { ReactNode } from "react";

import { requireUser } from "@/lib/auth/guards";

/**
 * Server-side protection wrapper for protected content. Awaits `requireUser`,
 * which redirects unauthenticated visitors to the login page (carrying an
 * optional `next`). Complements the middleware; RLS remains the authoritative
 * data boundary.
 */
export async function ProtectedRoute({
  children,
  next,
}: {
  children: ReactNode;
  next?: string;
}) {
  await requireUser(next);
  return <>{children}</>;
}
