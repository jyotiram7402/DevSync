"use client";

import { ArrowUpDown } from "lucide-react";

import { SEARCH_SORT_OPTIONS } from "@/features/search/constants";
import type { SearchSortKey } from "@/features/search/types";
import { cn } from "@/utils/cn";

/**
 * SortSelector — chooses the result ordering. Native <select> for built-in
 * keyboard and screen-reader support.
 */
export function SortSelector({
  value,
  onChange,
  className,
}: {
  value: SearchSortKey;
  onChange: (value: SearchSortKey) => void;
  className?: string;
}) {
  return (
    <label className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <ArrowUpDown className="size-4 text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">Sort results by</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SearchSortKey)}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {SEARCH_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
