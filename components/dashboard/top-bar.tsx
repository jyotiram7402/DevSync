"use client";

import { Menu } from "lucide-react";

import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { NotificationMenu } from "@/components/dashboard/notification-menu";
import { UserDropdown } from "@/components/dashboard/user-dropdown";
import { GlobalSearchBar } from "@/features/search/components/global-search-bar";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import type { AuthUser } from "@/types/auth";

/**
 * Sticky top navigation bar. Hosts the mobile-drawer trigger, workspace
 * switcher, breadcrumbs (desktop), global search / command launcher,
 * notifications, theme toggle, and the account dropdown.
 */
export function TopBar({ user }: { user: AuthUser }) {
  const setMobileNavOpen = useUIStore((state) => state.setMobileNavOpen);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        aria-controls="mobile-navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <WorkspaceSwitcher />
      <Breadcrumbs className="hidden md:block" />

      <div className="ml-auto flex items-center gap-1.5">
        <GlobalSearchBar />
        <NotificationMenu />
        <ThemeToggle />
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
