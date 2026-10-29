import type { ReactNode } from "react";

import { AddSheet } from "@/components/dashboard/add-sheet";
import { BottomTabBar } from "@/components/dashboard/bottom-tab-bar";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { MoreSheet } from "@/components/dashboard/more-sheet";
import { Sidebar, type SidebarSpace } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import type { AuthUser } from "@/types/auth";

/**
 * Authenticated application shell. A Server Component that arranges the client
 * chrome around server-rendered page content:
 *   phone   — top bar + bottom bar (Home · Snippets · Add · Spaces · More)
 *   tablet  — icon rail + top bar with breadcrumbs
 *   desktop — full sidebar (Library group, your Spaces) + top bar
 * The page itself scrolls (no inner scroll container), so sticky headers inside
 * pages stick to the viewport. Gutters are 16 / 24 / 32px, and on phones the
 * content clears the bottom bar and the home indicator.
 */
export function AppShell({
  user,
  spaces,
  children,
}: {
  user: AuthUser;
  spaces: ReadonlyArray<SidebarSpace>;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:border focus:border-border focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-overlay"
      >
        Skip to content
      </a>
      <Sidebar spaces={spaces} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={user} />
        <main
          id="main"
          tabIndex={-1}
          className="flex flex-1 flex-col pb-[calc(var(--bottom-nav-height)_+_env(safe-area-inset-bottom,0px)_+_1.5rem)] outline-none md:pb-0"
        >
          <div className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
          <DashboardFooter />
        </main>
      </div>
      <BottomTabBar />
      <AddSheet />
      <MoreSheet />
    </div>
  );
}
