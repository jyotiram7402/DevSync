"use client";

import { useEffect, useRef } from "react";

import { SearchEmptyState } from "@/features/search/components/search-empty-state";
import { SearchLoading } from "@/features/search/components/search-loading";
import { SearchPagination } from "@/features/search/components/search-pagination";
import { SearchResultCard } from "@/features/search/components/search-result-card";
import type { SearchResult } from "@/features/search/types";
import { cn } from "@/utils/cn";

export interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  loading: boolean;
  error: string | null;
  hasQuery: boolean;
  variant?: "page" | "infinite";
  /** Keyboard-highlighted row (modal). */
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  onSelect?: (result: SearchResult) => void;
  listId?: string;
  /** Pagination (variant="page"). */
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  /** Infinite scroll (variant="infinite"). */
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

function InfiniteSentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onVisible);
  callbackRef.current = onVisible;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) callbackRef.current();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} aria-hidden="true" className="h-px w-full" />;
}

/**
 * SearchResults — renders the result list with loading, empty, no-results, and
 * either pagination (page) or infinite scroll (modal/page). The list is a
 * listbox; rows are options with a keyboard-driven active descendant.
 */
export function SearchResults({
  results,
  query,
  loading,
  error,
  hasQuery,
  variant = "page",
  activeIndex,
  onActiveChange,
  onSelect,
  listId = "search-results",
  page = 1,
  totalPages = 1,
  onPageChange,
  hasMore = false,
  onLoadMore,
  className,
}: SearchResultsProps) {
  if (error) {
    return (
      <p role="alert" className="px-2 py-8 text-center text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (loading && results.length === 0) {
    return <SearchLoading className={className} />;
  }

  if (results.length === 0) {
    return <SearchEmptyState variant={hasQuery ? "no-results" : "idle"} query={query} />;
  }

  const activeDescendant =
    activeIndex !== undefined && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="listbox"
        aria-label="Search results"
        aria-activedescendant={activeDescendant}
        className="flex flex-col gap-1"
      >
        {results.map((result, index) => (
          <SearchResultCard
            key={`${result.type}-${result.id}`}
            id={`${listId}-opt-${index}`}
            result={result}
            query={query}
            active={activeIndex === index}
            onMouseEnter={onActiveChange ? () => onActiveChange(index) : undefined}
            onSelect={onSelect ? () => onSelect(result) : undefined}
          />
        ))}
      </div>

      {loading && results.length > 0 ? (
        <p className="py-2 text-center text-xs text-muted-foreground" aria-live="polite">
          Loading…
        </p>
      ) : null}

      {variant === "infinite" && hasMore && onLoadMore ? (
        <InfiniteSentinel onVisible={onLoadMore} />
      ) : null}

      {variant === "page" && onPageChange ? (
        <SearchPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      ) : null}
    </div>
  );
}
