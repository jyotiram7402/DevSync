"use client";

import { Menu } from "lucide-react";

import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { NotificationMenu } from "@/components/dashboard/notification-menu";
import { QuickCaptureButton } from "@/components/dashboard/quick-capture-button";
import { UserDropdown } from "@/components/dashboard/user-dropdown";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { GlobalSearchBar } from "@/features/search/components/global-search-bar";
import { useUIStore } from "@/stores/ui-store";
import type { AuthUser } from "@/types/auth";

/**
 * Sticky top navigation bar, laid out per breakpoint so it never overflows:
 *   phone  — drawer trigger + logo mark · quick add, search, account
 *   sm+    — adds notifications + theme (on phones those live in the drawer)
 *   md+    — breadcrumbs take the remaining width and truncate (sidebar has nav)
 *   lg+    — search expands from an icon to the full field
 * The action group never shrinks; the breadcrumb is the only flexible part.
 */
export function TopBar({ user }: { user: AuthUser }) {
  const setMobileNavOpen = useUIStore((state) => state.setMobileNavOpen);

  return (
    <header className="sticky top-0 z-nav flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        aria-label="Open navigation"
        aria-controls="mobile-navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <Logo href="/dashboard/home" className="shrink-0 md:hidden" wordmarkClassName="hidden sm:inline" />

      <Breadcrumbs className="hidden flex-1 md:block" />

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
        <QuickCaptureButton />
        <GlobalSearchBar />
        <NotificationMenu className="hidden sm:block" />
        <ThemeToggle className="hidden sm:inline-flex" />
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
