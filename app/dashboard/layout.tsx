import type { ReactNode } from "react";

import { AppShell } from "@/components/dashboard/app-shell";
import { QuickCaptureProvider } from "@/features/capture/quick-capture-provider";
import { RegisterDevice } from "@/features/dashboard/components/register-device";
import { SearchProvider } from "@/features/search/search-provider";
import { listMySpaces } from "@/features/spaces/services/space-service";
import { requireUser } from "@/lib/auth/guards";

/**
 * Authenticated dashboard layout. Server Component: enforces authentication
 * (redirecting to /login when signed out — defense in depth atop the
 * middleware) and renders the application shell with the current user and
 * their Spaces (listed by name in the desktop sidebar). The SearchProvider
 * hosts the global command palette (⌘K) for the whole shell.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // In parallel: requireUser() redirects when signed out, and the room list then just fails quietly.
  const [user, spacesResult] = await Promise.all([requireUser(), listMySpaces()]);
  const spaces = spacesResult.ok ? spacesResult.data.map(({ id, name }) => ({ id, name })) : [];

  return (
    <SearchProvider>
      <QuickCaptureProvider>
        <RegisterDevice />
        <AppShell user={user} spaces={spaces}>
          {children}
        </AppShell>
      </QuickCaptureProvider>
    </SearchProvider>
  );
}
