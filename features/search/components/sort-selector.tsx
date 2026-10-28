"use client";

import { useId } from "react";

import { Select } from "@/components/ui/select";
import { SEARCH_SORT_OPTIONS } from "@/features/search/constants";
import type { SearchSortKey } from "@/features/search/types";
import { cn } from "@/utils/cn";

function isSortKey(value: string): value is SearchSortKey {
  return SEARCH_SORT_OPTIONS.some((option) => option.value === value);
}

/** SortSelector — result order, as a labeled native select. */
export function SortSelector({
  value,
  onChange,
  className,
}: {
  value: SearchSortKey;
  onChange: (value: SearchSortKey) => void;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <label htmlFor={id} className="shrink-0 text-sm text-muted-foreground">
        Sort
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (isSortKey(next)) onChange(next);
        }}
        className="w-auto min-w-40"
      >
        {SEARCH_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
