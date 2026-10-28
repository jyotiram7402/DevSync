"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavActive } from "@/lib/dashboard/navigation";
import { cn } from "@/utils/cn";

/**
 * A single navigation link. The active route gets the selection wash and
 * `aria-current`. Icon-only modes keep an accessible (sr-only) label plus a
 * native tooltip:
 *   collapsed  — icon-only at every width (user collapsed the sidebar)
 *   responsive — icon-only rail on tablets (md), full labels from lg
 * `inset` indents a nested item (Library views, rooms) in full mode.
 */
interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed?: boolean;
  responsive?: boolean;
  inset?: boolean;
  onNavigate?: () => void;
}

export function SidebarItem({
  href,
  label,
  icon: Icon,
  collapsed = false,
  responsive = false,
  inset = false,
  onNavigate,
}: SidebarItemProps) {
  const pathname = usePathname();
  const active = isNavActive(pathname, href);
  const mode = collapsed ? "icon" : responsive ? "rail" : "full";

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={mode === "full" ? undefined : label}
      className={cn(
        "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-fast pointer-coarse:h-11",
        active
          ? "bg-wash text-primary-ink"
          : "text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent",
        mode === "icon" && "justify-center px-2",
        mode === "rail" && "justify-center px-2 lg:justify-start lg:px-3",
        inset && mode === "full" && "pl-9",
        inset && mode === "rail" && "lg:pl-9",
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
