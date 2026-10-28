"use client";

import { ScrollableTabs } from "@/components/ui/scrollable-tabs";
import { RESOURCE_TABS } from "@/features/search/constants";
import type { TabValue } from "@/features/search/hooks/use-search";
import type { ResourceCounts } from "@/features/search/types";

/**
 * SearchTabs — result types in one scrolling row (it never wraps). A search
 * only counts the types it looked in, so on "All" every tab shows its number
 * and on a single type only that tab does (the others would read 0).
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

  return (
    <ScrollableTabs
      aria-label="Result types"
      activeId={active}
      onSelect={(id) => {
        const tab = RESOURCE_TABS.find((entry) => entry.value === id);
        if (tab) onChange(tab.value);
      }}
      items={RESOURCE_TABS.map((tab) => ({
        id: tab.value,
        label: tab.label,
        count:
          tab.value === "all"
            ? active === "all"
              ? total
              : null
            : active === "all" || active === tab.value
              ? counts[tab.value]
              : null,
      }))}
      className={className}
    />
  );
}
