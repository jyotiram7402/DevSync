"use client";

import { Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import type { RecentSearch } from "@/features/search/types";
import { cn } from "@/utils/cn";

/**
 * RecentSearches — recently used words (kept on this device). Choosing one
 * searches again; each has a visible Remove, and Clear empties the list.
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
    <section aria-labelledby="recent-searches-title" className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between gap-2 px-2">
        <h2 id="recent-searches-title" className="text-xs font-medium text-muted-foreground">
          Recent
        </h2>
        <Button type="button" variant="ghost" size="sm" onClick={onClear} className="-mr-2 text-muted-foreground">
          Clear
        </Button>
      </div>
      <ul className="flex flex-col">
        {recent.map((entry) => (
          <li key={entry.query} className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(entry.query)}
              className="flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-fast hover:bg-accent active:bg-accent pointer-coarse:min-h-11"
            >
              <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{entry.query}</span>
            </button>
            <IconButton
              label={`Remove ${entry.query} from recent searches`}
              icon={X}
              size="sm"
              onClick={() => onRemove(entry.query)}
              className="shrink-0 text-muted-foreground"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
