"use client";

import Link from "next/link";
import { Code2, FolderKanban, Library, Pin, Star, Tag, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RelativeTime } from "@/components/ui/relative-time";
import { SearchHighlight } from "@/features/search/components/search-highlight";
import type { SearchResourceType, SearchResult } from "@/features/search/types";
import { cn } from "@/utils/cn";

export const RESULT_TYPES: Record<SearchResourceType, { icon: LucideIcon; label: string; tile: string }> = {
  snippet: { icon: Code2, label: "Snippet", tile: "bg-kind-code/10 text-kind-code" },
  project: { icon: FolderKanban, label: "Project", tile: "bg-wash text-primary-ink" },
  collection: { icon: Library, label: "Collection", tile: "bg-kind-doc/10 text-kind-doc" },
  tag: { icon: Tag, label: "Tag", tile: "bg-muted text-muted-foreground" },
};

export interface SearchResultCardProps {
  result: SearchResult;
  query: string;
  /** Keyboard-highlighted row in the palette. */
  active?: boolean;
  id?: string;
  /** Inside the palette's listbox (role="option"); on the page it's a plain link. */
  asOption?: boolean;
  onSelect?: () => void;
  onMouseEnter?: () => void;
}

/**
 * SearchResultCard — one result: what it is, the title and a line of the
 * matching text with the matches highlighted, then pinned/favorite, language,
 * and when it last changed. The whole row opens the item.
 */
export function SearchResultCard({
  result,
  query,
  active = false,
  id,
  asOption = false,
  onSelect,
  onMouseEnter,
}: SearchResultCardProps) {
  const type = RESULT_TYPES[result.type];
  const Icon = type.icon;

  return (
    <Link
      id={id}
      href={result.href}
      role={asOption ? "option" : undefined}
      aria-selected={asOption ? active : undefined}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex min-w-0 items-start gap-3 rounded-lg border p-3 text-left transition-colors duration-fast active:bg-accent",
        asOption ? "border-transparent hover:bg-accent" : "border-border bg-card hover:border-input/60",
        active && "border-border bg-accent",
      )}
    >
      <span
        role="img"
        aria-label={type.label}
        className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md", type.tile)}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <SearchHighlight
            text={result.title}
            query={query}
            className="min-w-0 truncate text-sm font-medium text-foreground"
          />
          {result.pinned ? (
            <>
              <Pin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Pinned</span>
            </>
          ) : null}
          {result.favorite ? (
            <>
              <Star className="size-3.5 shrink-0 fill-current text-favorite" aria-hidden="true" />
              <span className="sr-only">Favorite</span>
            </>
          ) : null}
        </span>

        {result.excerpt ? (
          <SearchHighlight
            text={result.excerpt}
            query={query}
            className="line-clamp-2 text-xs text-muted-foreground [overflow-wrap:anywhere]"
          />
        ) : null}

        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {result.subtitle ? <span className="min-w-0 truncate">{result.subtitle}</span> : null}
          {result.language ? <Badge variant="muted">{result.language}</Badge> : null}
          {result.usageCount !== null ? (
            <span>{result.usageCount === 1 ? "1 snippet" : `${result.usageCount} snippets`}</span>
          ) : null}
          {result.archived ? <Badge variant="outline">Archived</Badge> : null}
          {result.updatedAt ? <RelativeTime value={result.updatedAt} /> : null}
        </span>
      </span>
    </Link>
  );
}
