"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/utils/cn";

/**
 * A single navigation link. Highlights when the current route matches (exact
 * or nested) and exposes `aria-current`. Icon-only modes keep an accessible
 * (sr-only) label plus a native tooltip:
 *   collapsed  — icon-only at every width (user collapsed the sidebar)
 *   responsive — icon-only rail on tablets (md), full labels from lg
 */
interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed?: boolean;
  responsive?: boolean;
  onNavigate?: () => void;
}

export function SidebarItem({
  href,
  label,
  icon: Icon,
  collapsed = false,
  responsive = false,
  onNavigate,
}: SidebarItemProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  const mode = collapsed ? "icon" : responsive ? "rail" : "full";

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={mode === "full" ? undefined : label}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
        mode === "icon" && "justify-center px-2",
        mode === "rail" && "justify-center px-2 lg:justify-start lg:px-3",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span
        className={cn(
          "truncate",
          mode === "icon" && "sr-only",
          mode === "rail" && "sr-only lg:not-sr-only lg:truncate",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
