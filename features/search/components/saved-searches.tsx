"use client";

import { Bookmark, X } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import type { SavedSearch } from "@/features/search/types";
import { cn } from "@/utils/cn";

/**
 * SavedSearches — named, reusable searches (kept on this device). Applying one
 * restores its words, type, sort and filters; each has a visible Remove.
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
    <section aria-labelledby="saved-searches-title" className={cn("flex flex-col gap-1", className)}>
      <h2 id="saved-searches-title" className="text-xs font-medium text-muted-foreground">
        Saved searches
      </h2>
      <ul className="-mx-1 flex flex-col">
        {saved.map((entry) => (
          <li key={entry.id} className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onApply(entry)}
              className="flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm transition-colors duration-fast hover:bg-accent active:bg-accent pointer-coarse:min-h-11"
            >
              <Bookmark className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{entry.name}</span>
            </button>
            <IconButton
              label={`Remove saved search ${entry.name}`}
              icon={X}
              size="sm"
              onClick={() => onRemove(entry.id)}
              className="shrink-0 text-muted-foreground"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
