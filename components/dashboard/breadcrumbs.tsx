"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTE_LABELS } from "@/lib/dashboard/navigation";
import { cn } from "@/utils/cn";

/**
 * Breadcrumb trail derived from the current pathname. The final segment is the
 * current page (aria-current); preceding segments link to their level.
 */
export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join("/")}`,
    label: ROUTE_LABELS[segment] ?? segment,
    isLast: index === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0 text-sm", className)}>
      <ol className="flex items-center gap-1.5">
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {crumb.isLast ? (
              <span className="truncate font-medium text-foreground" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <>
                <Link
                  href={crumb.href}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {crumb.label}
                </Link>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
