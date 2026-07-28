"use client";

import { Clock, X } from "lucide-react";

import type { RecentSearch } from "@/features/search/types";
import { cn } from "@/utils/cn";

/**
 * RecentSearches — recently used queries (device-local). Selecting one re-runs
 * it; each can be removed, and the whole list cleared.
 */
export function RecentSearches({
  recent,
  onSelect,
  onRemove,
  onClear,
  className,
}: {
  recent: RecentSearch[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  onClear: () => void;
  className?: string;
}) {
  if (recent.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-medium text-muted-foreground">Recent</span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:underline"
        >
          Clear
        </button>
      </div>
      <ul aria-label="Recent searches">
        {recent.map((entry) => (
          <li key={entry.query} className="group flex items-center">
            <button
              type="button"
              onClick={() => onSelect(entry.query)}
              className="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{entry.query}</span>
            </button>
            <button
              type="button"
              aria-label={`Remove ${entry.query} from recent searches`}
              onClick={() => onRemove(entry.query)}
              className="rounded-md p-1 text-muted-foreground opacity-0 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
