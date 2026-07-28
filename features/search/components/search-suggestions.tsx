"use client";

import Link from "next/link";
import { Code2, FolderKanban, Library, Tag, type LucideIcon } from "lucide-react";

import type { SearchResourceType, SearchSuggestion } from "@/features/search/types";
import { cn } from "@/utils/cn";

const ICONS: Record<SearchResourceType, LucideIcon> = {
  snippet: Code2,
  project: FolderKanban,
  collection: Library,
  tag: Tag,
};

/**
 * SearchSuggestions — typeahead suggestions grouped as a simple list. Each row
 * links to the entity (or the filtered search for tags).
 */
export function SearchSuggestions({
  suggestions,
  onSelect,
  className,
}: {
  suggestions: SearchSuggestion[];
  onSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
}) {
  if (suggestions.length === 0) return null;

  return (
    <ul className={cn("flex flex-col", className)} aria-label="Suggestions">
      {suggestions.map((suggestion, index) => {
        const Icon = ICONS[suggestion.type];
        const content = (
          <>
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{suggestion.label}</span>
            <span className="ml-auto text-[11px] capitalize text-muted-foreground">
              {suggestion.type}
            </span>
          </>
        );
        const className2 =
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

        return (
          <li key={`${suggestion.type}-${suggestion.label}-${index}`}>
            {suggestion.href ? (
              <Link
                href={suggestion.href}
                className={className2}
                onClick={() => onSelect?.(suggestion)}
              >
                {content}
              </Link>
            ) : (
              <button
                type="button"
                className={cn(className2, "w-full text-left")}
                onClick={() => onSelect?.(suggestion)}
              >
                {content}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
