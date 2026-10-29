"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { cn } from "@/utils/cn";

/**
 * ScrollableTabs — one horizontally scrolling row of filter chips (Library,
 * Spaces, Search). It never wraps onto a second line and keeps the active chip
 * in view. Items with `href` render as links (`aria-current="page"`) inside a
 * <nav>; the rest are toggle buttons (`aria-pressed`) that call `onSelect`.
 * Chips are 36px with a 44px hit area.
 */
export interface TabItem {
  id: string;
  label: string;
  /** Shown after the label; omit when unknown. */
  count?: number | null;
  icon?: LucideIcon;
  /** Route-driven filter. Omit for an in-page filter button. */
  href?: string;
}

interface ScrollableTabsProps {
  items: ReadonlyArray<TabItem>;
  activeId: string;
  onSelect?: (id: string) => void;
  "aria-label": string;
  className?: string;
}

export function ScrollableTabs({ items, activeId, onSelect, className, ...rest }: ScrollableTabsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLElement | null>(null);

  // Center the active chip in the row (horizontal only; never scrolls the page).
  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = activeRef.current;
    if (!scroller || !active) return;
    const left = active.offsetLeft - (scroller.clientWidth - active.offsetWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, left) });
  }, [activeId]);

  const isNavigation = items.length > 0 && items.every((item) => item.href !== undefined);

  const chips = items.map((item) => {
    const active = item.id === activeId;
    const Icon = item.icon;
    const setRef = (node: HTMLElement | null) => {
      if (active) activeRef.current = node;
    };
    const chipClass = cn(
      "relative inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition-colors duration-fast before:absolute before:inset-x-0 before:-inset-y-1 active:bg-accent",
      active
        ? "border-transparent bg-wash text-primary-ink"
        : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
    );
    const content = (
      <>
        {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
        {item.label}
        {item.count !== undefined && item.count !== null ? (
          <span className="tabular-nums text-xs text-muted-foreground">{item.count}</span>
        ) : null}
      </>
    );

    return (
      <li key={item.id} className="flex">
        {item.href !== undefined ? (
          <Link ref={setRef} href={item.href} aria-current={active ? "page" : undefined} className={chipClass}>
            {content}
          </Link>
        ) : (
          <button
            ref={setRef}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect?.(item.id)}
            className={chipClass}
          >
            {content}
          </button>
        )}
      </li>
    );
  });

  const row = (
    <div
      ref={scrollerRef}
      className={cn("no-scrollbar relative -mx-1 overflow-x-auto overscroll-x-contain px-1 py-1", className)}
    >
      <ul className="flex w-max gap-2">{chips}</ul>
    </div>
  );

  return isNavigation ? (
    <nav aria-label={rest["aria-label"]}>{row}</nav>
  ) : (
    <div role="group" aria-label={rest["aria-label"]}>
      {row}
    </div>
  );
}
