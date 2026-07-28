import type { ReactNode } from "react";

import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { MobileNavigation } from "@/components/dashboard/mobile-navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import type { AuthUser } from "@/types/auth";

/**
 * Authenticated application shell. A Server Component that arranges the client
 * chrome (sidebar, top bar, mobile drawer) around server-rendered page content.
 * The content column is `min-w-0` so it never overflows horizontally, and its
 * <main> scrolls independently of the fixed sidebar.
 */
export function AppShell({ user, children }: { user: AuthUser; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={user} />
        <main id="main" className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
          <DashboardFooter />
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
