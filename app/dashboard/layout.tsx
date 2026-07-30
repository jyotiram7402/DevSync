import type { ReactNode } from "react";

import { AppShell } from "@/components/dashboard/app-shell";
import { QuickCaptureProvider } from "@/features/capture/quick-capture-provider";
import { RegisterDevice } from "@/features/dashboard/components/register-device";
import { SearchProvider } from "@/features/search/search-provider";
import { requireUser } from "@/lib/auth/guards";

/**
 * Authenticated dashboard layout. Server Component: enforces authentication
 * (redirecting to /login when signed out — defense in depth atop the
 * middleware) and renders the application shell with the current user. The
 * SearchProvider hosts the global command palette (⌘K) for the whole shell.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <SearchProvider>
      <QuickCaptureProvider>
        <RegisterDevice />
        <AppShell user={user}>{children}</AppShell>
      </QuickCaptureProvider>
    </SearchProvider>
  );
}
