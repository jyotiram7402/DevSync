"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Breadcrumbs, useBreadcrumbTrail } from "@/components/dashboard/breadcrumbs";
import { NotificationMenu } from "@/components/dashboard/notification-menu";
import { QuickCaptureButton } from "@/components/dashboard/quick-capture-button";
import { UserDropdown } from "@/components/dashboard/user-dropdown";
import { ConnectionBanner } from "@/components/realtime/connection-banner";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { GlobalSearchBar } from "@/features/search/components/global-search-bar";
import { NAV_HOME } from "@/lib/dashboard/navigation";
import type { AuthUser } from "@/types/auth";

/**
 * Sticky top bar, laid out per breakpoint so it never overflows:
 *   phone  — back link (on inner pages) + page title · search, account
 *            (adding and everything else live in the bottom bar)
 *   md+    — breadcrumbs · Quick add, search, notifications, theme, account
 *   lg+    — search expands from an icon to the full field
 * It clears the notch in the installed app, and the connection banner sits
 * underneath it when the device is offline.
 */
export function TopBar({ user }: { user: AuthUser }) {
  return (
    <header className="sticky top-0 z-nav border-b border-border bg-background/95 pt-safe backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center gap-2 px-4 md:px-6">
        <PhoneTitle />
        <Breadcrumbs className="hidden min-w-0 flex-1 md:block" />

        <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-1.5">
          <QuickCaptureButton className="hidden md:inline-flex" />
          <GlobalSearchBar />
          <NotificationMenu className="hidden md:block" />
          <ThemeToggle className="hidden md:inline-flex" />
          <UserDropdown user={user} />
        </div>
      </div>
      <ConnectionBanner />
    </header>
  );
}

/** Phone title: the logo on Home, otherwise the page name with a back link on inner pages. */
function PhoneTitle() {
  const crumbs = useBreadcrumbTrail();
  const current = crumbs[crumbs.length - 1];
  const parent = crumbs
    .slice(0, -1)
    .reverse()
    .find((crumb) => crumb.linkable);

  if (!current || current.href === NAV_HOME.href) {
    return (
      <div className="flex min-w-0 flex-1 md:hidden">
        <Logo href={NAV_HOME.href} />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 md:hidden">
      {parent ? (
        <Button asChild variant="ghost" size="icon" className="-ml-2 shrink-0">
          <Link href={parent.href} aria-label={`Back to ${parent.label}`}>
            <ChevronLeft aria-hidden="true" />
          </Link>
        </Button>
      ) : null}
      <span className="truncate text-base font-semibold">{current.label}</span>
    </div>
  );
}
