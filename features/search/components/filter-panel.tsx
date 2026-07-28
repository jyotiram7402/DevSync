"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { SearchFilters } from "@/features/search/components/search-filters";
import { activeFilterCount } from "@/features/search/services/filter-builder";
import type { SearchFilters as SearchFiltersModel } from "@/features/search/types";
import type { SelectOption } from "@/features/snippets/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

/**
 * FilterPanel — collapsible container around the filter controls. Shows the
 * active-filter count and a clear action.
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
  const count = activeFilterCount(filters);

  return (
    <section className={cn("rounded-xl border", className)} aria-label="Search filters">
      <div className="flex items-center justify-between gap-2 p-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="gap-1.5"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
          {count > 0 ? (
            <span className="rounded-full bg-brand/10 px-1.5 text-[10px] font-medium text-brand">
              {count}
            </span>
          ) : null}
        </Button>
        {count > 0 ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClear} className="gap-1">
            <X className="size-3.5" aria-hidden="true" />
            Clear
          </Button>
        ) : null}
      </div>

      {open ? (
        <div className="border-t p-4">
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
