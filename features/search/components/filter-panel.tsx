"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { SearchFilters } from "@/features/search/components/search-filters";
import { activeFilterCount } from "@/features/search/services/filter-builder";
import type { SearchFilters as SearchFiltersModel } from "@/features/search/types";
import type { SelectOption } from "@/features/snippets/types";
import { cn } from "@/utils/cn";

/**
 * FilterPanel — a Filters button (with how many are on) that opens the filter
 * controls, plus Clear while any filter is on.
 */
export function FilterPanel({
  filters,
  onChange,
  onClear,
  projectOptions,
  collectionOptions,
  defaultOpen = false,
  className,
}: {
  filters: SearchFiltersModel;
  onChange: (filters: SearchFiltersModel) => void;
  onClear: () => void;
  projectOptions?: SelectOption[];
  collectionOptions?: SelectOption[];
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const count = activeFilterCount(filters);

  return (
    <section aria-label="Search filters" className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <SlidersHorizontal aria-hidden="true" />
          Filters
          {count > 0 ? (
            <span className="rounded-full bg-primary/10 px-1.5 text-xs font-medium tabular-nums text-primary-ink">
              {count}
              <span className="sr-only"> on</span>
            </span>
          ) : null}
        </Button>
        {count > 0 ? (
          <Button type="button" variant="ghost" onClick={onClear}>
            <X aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </div>

      {open ? (
        <div id={panelId} className="rounded-lg border border-border bg-card p-4">
          <SearchFilters
            filters={filters}
            onChange={onChange}
            {...(projectOptions ? { projectOptions } : {})}
            {...(collectionOptions ? { collectionOptions } : {})}
          />
        </div>
      ) : null}
    </section>
  );
}
