"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/utils/cn";

/**
 * A single navigation link. Highlights when the current route matches (exact
 * or nested), exposes `aria-current`, and collapses to an icon with an
 * accessible label + tooltip when the sidebar is collapsed.
 */
interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarItem({ href, label, icon: Icon, collapsed = false, onNavigate }: SidebarItemProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
    </Link>
  );
}
