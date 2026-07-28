"use client";

import { RESOURCE_TABS } from "@/features/search/constants";
import type { TabValue } from "@/features/search/hooks/use-search";
import type { ResourceCounts } from "@/features/search/types";
import { cn } from "@/utils/cn";

/**
 * SearchTabs — resource-type filter tabs with result counts. The "All" tab
 * shows the combined total.
 */
export function SearchTabs({
  active,
  counts,
  onChange,
  className,
}: {
  active: TabValue;
  counts: ResourceCounts;
  onChange: (value: TabValue) => void;
  className?: string;
}) {
  const total = counts.snippet + counts.project + counts.collection + counts.tag;

  function countFor(value: TabValue): number {
    return value === "all" ? total : counts[value];
  }

  return (
    <div role="tablist" aria-label="Result types" className={cn("flex flex-wrap gap-1", className)}>
      {RESOURCE_TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/50",
            )}
          >
            <span>{tab.label}</span>
            <span className="rounded bg-muted px-1 text-[10px] tabular-nums text-muted-foreground">
              {countFor(tab.value)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
