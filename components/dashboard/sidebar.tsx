"use client";

import { PanelLeft, PanelLeftClose } from "lucide-react";

import { SidebarItem } from "@/components/dashboard/sidebar-item";
import { Button } from "@/components/ui/button";
import { DASHBOARD_PRIMARY_NAV, DASHBOARD_SECONDARY_NAV } from "@/lib/dashboard/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/cn";

/**
 * Desktop sidebar (hidden below md; mobile uses the drawer). Width is driven by
 * the collapsed UI state; collapsing reflows the content column automatically.
 */
export function Sidebar() {
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "hidden shrink-0 flex-col border-r bg-background transition-[width] duration-200 md:flex",
        collapsed ? "md:w-16" : "md:w-64",
      )}
    >
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {DASHBOARD_PRIMARY_NAV.map((item) => (
          <SidebarItem key={item.href} {...item} collapsed={collapsed} />
        ))}
        <div className="my-2 h-px bg-border" role="separator" />
        {DASHBOARD_SECONDARY_NAV.map((item) => (
          <SidebarItem key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="border-t p-3">
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
