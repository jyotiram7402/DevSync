"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTE_LABELS } from "@/lib/dashboard/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/cn";

/** Segments that are grouping folders with no page of their own (never linked). */
const NO_INDEX_SEGMENTS = new Set(["library"]);

/** Segments whose next segment is a value, not a page (a room code after "join"); the trail ends there. */
const VALUE_SEGMENTS = new Set(["join"]);

/** What a record id means, by the segment that precedes it. */
const ID_LABELS: Record<string, string> = {
  spaces: "Room",
  snippets: "Snippet",
  projects: "Project",
  collections: "Collection",
  images: "Item",
  links: "Item",
  docs: "Item",
  files: "Item",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecordId(segment: string): boolean {
  return UUID.test(segment) || (segment.length >= 20 && /\d/.test(segment));
}

function humanize(segment: string): string {
  const text = segment.replace(/[-_]+/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export interface Crumb {
  href: string;
  label: string;
  isLast: boolean;
  /** False for the current page and for grouping folders with no page (Library). */
  linkable: boolean;
}

/**
 * The trail for the current pathname (the /dashboard root is implied and
 * omitted). Record ids render as a friendly label — or the page's own name
 * when it registers one via <BreadcrumbLabel>. Shared by the breadcrumbs and
 * the phone top bar's title and back link.
 */
export function useBreadcrumbTrail(): Crumb[] {
  const pathname = usePathname();
  const pageLabel = useUIStore((state) => state.breadcrumbLabel);

  const all = pathname.split("/").filter(Boolean);
  const offset = all[0] === "dashboard" ? 1 : 0;
  const valueAt = all.slice(offset).findIndex((segment) => VALUE_SEGMENTS.has(segment));
  const segments = all.slice(offset, valueAt === -1 ? undefined : offset + valueAt + 1);

  return segments.map((segment, index) => {
    const isLast = index === segments.length - 1;
    const previous = segments[index - 1] ?? "";
    const id = isRecordId(segment);
    const label = id
      ? isLast && pageLabel
        ? pageLabel
        : (ID_LABELS[previous] ?? "Details")
      : (ROUTE_LABELS[segment] ?? humanize(segment));
    return {
      href: `/${all.slice(0, offset + index + 1).join("/")}`,
      label,
      isLast,
      linkable: !isLast && !NO_INDEX_SEGMENTS.has(segment),
    };
  });
}

/**
 * Breadcrumb trail (tablet and desktop). It truncates instead of overflowing,
 * so it can never run under the top-bar actions.
 */
export function Breadcrumbs({ className }: { className?: string }) {
  const crumbs = useBreadcrumbTrail();

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0 overflow-hidden py-1 pl-0.5 text-sm", className)}>
      <ol className="flex min-w-0 items-center gap-1.5">
        {crumbs.map((crumb) => (
          <li
            key={crumb.href}
            className={cn("flex items-center gap-1.5", crumb.isLast ? "min-w-0" : "shrink-0")}
          >
            {crumb.isLast ? (
              <span className="truncate font-medium text-foreground" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <>
                {crumb.linkable ? (
                  <Link
                    href={crumb.href}
                    className="whitespace-nowrap rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="whitespace-nowrap text-muted-foreground">{crumb.label}</span>
                )}
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
