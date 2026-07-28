"use client";

import Link from "next/link";
import { Code2, FolderKanban, Library, Pin, Star, Tag, type LucideIcon } from "lucide-react";

import { SearchHighlight } from "@/features/search/components/search-highlight";
import type { SearchResourceType, SearchResult } from "@/features/search/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

const ICONS: Record<SearchResourceType, LucideIcon> = {
  snippet: Code2,
  project: FolderKanban,
  collection: Library,
  tag: Tag,
};

export interface SearchResultCardProps {
  result: SearchResult;
  query: string;
  active?: boolean;
  id?: string;
  onSelect?: () => void;
  onMouseEnter?: () => void;
}

/**
 * SearchResultCard — one result row. Renders as a link; `active` reflects the
 * keyboard-highlighted row (role="option"/aria-selected are set by the list).
 */
export function SearchResultCard({
  result,
  query,
  active = false,
  id,
  onSelect,
  onMouseEnter,
}: SearchResultCardProps) {
  const Icon = ICONS[result.type];

  return (
    <Link
      id={id}
      href={result.href}
      role="option"
      aria-selected={active}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex items-start gap-3 rounded-lg border border-transparent p-3 text-left transition-colors",
        "hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "border-border bg-secondary/60",
      )}
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-1.5">
          <SearchHighlight
            text={result.title}
            query={query}
            className="truncate text-sm font-medium"
          />
          {result.pinned ? <Pin className="size-3 text-muted-foreground" aria-label="Pinned" /> : null}
          {result.favorite ? (
            <Star className="size-3 fill-amber-400 text-amber-400" aria-label="Favorite" />
          ) : null}
        </span>

        {result.excerpt ? (
          <SearchHighlight
            text={result.excerpt}
            query={query}
            className="line-clamp-1 text-xs text-muted-foreground"
          />
        ) : null}

        <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          {result.subtitle ? <span>{result.subtitle}</span> : null}
          {result.language ? (
            <Badge variant="muted" className="px-1.5 py-0">
              {result.language}
            </Badge>
          ) : null}
          {result.usageCount !== null ? <span>{result.usageCount} uses</span> : null}
          {result.archived ? <span className="italic">archived</span> : null}
        </span>
      </span>
    </Link>
  );
}
