"use client";

import { Bookmark, X } from "lucide-react";

import type { SavedSearch } from "@/features/search/types";
import { cn } from "@/utils/cn";

/**
 * SavedSearches — named, reusable searches (device-local). Applying one restores
 * its query, types, sort, and filters.
 */
export function SavedSearches({
  saved,
  onApply,
  onRemove,
  className,
}: {
  saved: SavedSearch[];
  onApply: (entry: SavedSearch) => void;
  onRemove: (id: string) => void;
  className?: string;
}) {
  if (saved.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="px-2 text-xs font-medium text-muted-foreground">Saved searches</span>
      <ul aria-label="Saved searches">
        {saved.map((entry) => (
          <li key={entry.id} className="group flex items-center">
            <button
              type="button"
              onClick={() => onApply(entry)}
              className="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Bookmark className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{entry.name}</span>
            </button>
            <button
              type="button"
              aria-label={`Remove saved search ${entry.name}`}
              onClick={() => onRemove(entry.id)}
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
