"use client";

import { Hash, PanelLeft, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SidebarItem } from "@/components/dashboard/sidebar-item";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  LIBRARY_NAV,
  NAV_PROJECTS,
  NAV_SPACES,
  SIDEBAR_FOOTER,
  SIDEBAR_MAIN,
  isNavActive,
} from "@/lib/dashboard/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/cn";

/** Rooms listed under "Spaces" before the "All spaces" link takes over. */
const MAX_LISTED_SPACES = 5;

export interface SidebarSpace {
  id: string;
  name: string;
}

/**
 * Desktop sidebar (hidden below md; phones use the bottom bar and its sheets).
 * Sticky and viewport-tall, so navigation stays in view while the page scrolls.
 *   md (tablet) — compact icon rail, leaving room for content
 *   lg+         — full labels with the Library group and your Spaces, or the
 *                 icon rail when the user collapses it
 */
export function Sidebar({ spaces }: { spaces: ReadonlyArray<SidebarSpace> }) {
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const pathname = usePathname();
  const listed = spaces.slice(0, MAX_LISTED_SPACES);

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-background transition-[width] duration-base ease-out md:flex",
        collapsed ? "md:w-16" : "md:w-16 lg:w-64",
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center" : "justify-center lg:justify-start lg:px-5",
        )}
      >
        <Logo href="/dashboard/home" wordmarkClassName={collapsed ? "hidden" : "hidden lg:inline"} />
      </div>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {SIDEBAR_MAIN.map((item) => (
          <SidebarItem key={item.href} {...item} collapsed={collapsed} responsive />
        ))}

        <SidebarGroup label="Library" collapsed={collapsed}>
          {LIBRARY_NAV.map((item) => (
            <SidebarItem key={item.href} {...item} collapsed={collapsed} responsive inset />
          ))}
        </SidebarGroup>

        <SidebarGroup collapsed={collapsed}>
          <SidebarItem {...NAV_SPACES} collapsed={collapsed} responsive />
          {/* Your rooms, by name — full sidebar only. */}
          {!collapsed && listed.length > 0 ? (
            <ul className="hidden flex-col gap-0.5 lg:flex">
              {listed.map((space) => {
                const href = `${NAV_SPACES.href}/${space.id}`;
                const active = isNavActive(pathname, href);
                return (
                  <li key={space.id}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-8 items-center gap-2 rounded-md pl-9 pr-3 text-sm transition-colors duration-fast pointer-coarse:h-11",
                        active
                          ? "bg-wash font-medium text-primary-ink"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent",
                      )}
                    >
                      <Hash className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{space.name}</span>
                    </Link>
                  </li>
                );
              })}
              {spaces.length > MAX_LISTED_SPACES ? (
                <li>
                  <Link
                    href={NAV_SPACES.href}
                    className="flex h-8 items-center rounded-md pl-9 pr-3 text-sm text-muted-foreground transition-colors duration-fast hover:bg-accent hover:text-foreground pointer-coarse:h-11"
                  >
                    All spaces ({spaces.length})
                  </Link>
                </li>
              ) : null}
            </ul>
          ) : null}
          <SidebarItem {...NAV_PROJECTS} collapsed={collapsed} responsive />
        </SidebarGroup>

        <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-3">
          {SIDEBAR_FOOTER.map((item) => (
            <SidebarItem key={item.href} {...item} collapsed={collapsed} responsive />
          ))}
        </div>
      </nav>

      {/* The rail is fixed on tablets, so the collapse control only appears at lg+. */}
      <div className="hidden border-t border-border p-3 lg:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn("w-full text-muted-foreground", collapsed ? "justify-center px-0" : "justify-start")}
        >
          {collapsed ? (
            <PanelLeft aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose aria-hidden="true" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

/**
 * A run of related items. With a label it shows a small heading in the full
 * sidebar; in the icon rail it becomes a divider line instead.
 */
function SidebarGroup({
  label,
  collapsed,
  children,
}: {
  label?: string;
  collapsed: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-3 flex flex-col gap-0.5 border-t border-border pt-3",
        !collapsed && "lg:mt-4 lg:border-t-0 lg:pt-0",
      )}
    >
      {label ? (
        <p
          className={cn(
            "px-3 pb-1 text-xs font-medium text-muted-foreground",
            collapsed ? "sr-only" : "sr-only lg:not-sr-only",
          )}
        >
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}
