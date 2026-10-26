"use client";

import { PanelLeft, PanelLeftClose } from "lucide-react";

import { SidebarItem } from "@/components/dashboard/sidebar-item";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { DASHBOARD_PRIMARY_NAV, DASHBOARD_SECONDARY_NAV } from "@/lib/dashboard/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/cn";

/**
 * Desktop sidebar (hidden below md; phones use the drawer + bottom tab bar).
 * Sticky and viewport-tall, so navigation stays in view while the page scrolls.
 *   md (tablet) — compact icon rail, leaving room for content
 *   lg+         — full labels, or the icon rail when the user collapses it
 */
export function Sidebar() {
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-background transition-[width] duration-200 md:flex",
        collapsed ? "md:w-16" : "md:w-16 lg:w-64",
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b",
          collapsed ? "justify-center" : "justify-center lg:justify-start lg:px-5",
        )}
      >
        <Logo
          href="/dashboard/home"
          wordmarkClassName={collapsed ? "hidden" : "hidden lg:inline"}
        />
      </div>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {DASHBOARD_PRIMARY_NAV.map((item) => (
          <SidebarItem key={item.href} {...item} collapsed={collapsed} responsive />
        ))}
        <div className="my-2 h-px bg-border" role="separator" />
        {DASHBOARD_SECONDARY_NAV.map((item) => (
          <SidebarItem key={item.href} {...item} collapsed={collapsed} responsive />
        ))}
      </nav>

      {/* The rail is fixed on tablets, so the collapse control only appears at lg+. */}
      <div className="hidden border-t p-3 lg:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
        >
          {collapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="size-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
