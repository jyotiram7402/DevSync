"use client";

import { useEffect, useRef } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { SearchEmptyState } from "@/features/search/components/search-empty-state";
import { SearchLoading } from "@/features/search/components/search-loading";
import { SearchPagination } from "@/features/search/components/search-pagination";
import { SearchResultCard } from "@/features/search/components/search-result-card";
import { ALL_RESOURCE_TYPES } from "@/features/search/constants";
import type { SearchResourceType, SearchResult } from "@/features/search/types";
import { cn } from "@/utils/cn";

const GROUP_TITLES: Record<SearchResourceType, string> = {
  snippet: "Snippets",
  project: "Projects",
  collection: "Collections",
  tag: "Tags",
};

export interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  loading: boolean;
  error: string | null;
  hasQuery: boolean;
  variant?: "page" | "infinite";
  /** Keyboard-highlighted row (palette). */
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  onSelect?: (result: SearchResult) => void;
  /** Id of the palette's listbox (the input points at it with aria-controls). */
  listId?: string;
  /** Pagination (variant="page"). */
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  /** Page: show the results in sections by type (the "All" tab). */
  grouped?: boolean;
  /** Infinite scroll (variant="infinite"). */
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
  /** Offered on "no results" while filters are narrowing the search. */
  onClearFilters?: () => void;
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
 * SearchResults — loading skeletons, an error with Try again, the idle and
 * no-results states (with Clear filters when filters are on), then the
 * results: in the palette a keyboard-driven listbox with infinite scroll; on
 * the page plain links, grouped by type on "All", with pages.
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
  grouped = false,
  hasMore = false,
  onLoadMore,
  onRetry,
  onClearFilters,
  className,
}: SearchResultsProps) {
  if (error) {
    return (
      <ErrorState
        title="Search didn't work"
        description={error}
        {...(onRetry ? { onRetry } : {})}
        pending={loading}
        className={className}
      />
    );
  }

  if (loading && results.length === 0) {
    return <SearchLoading className={className} />;
  }

  if (results.length === 0) {
    return (
      <SearchEmptyState
        variant={hasQuery ? "no-results" : "idle"}
        query={query}
        {...(onClearFilters ? { onClearFilters } : {})}
      />
    );
  }

  const loadingMore =
    loading && results.length > 0 ? (
      <p className="py-2 text-center text-xs text-muted-foreground" aria-live="polite">
        Loading…
      </p>
    ) : null;

  if (variant === "infinite") {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div role="listbox" id={listId} aria-label="Search results" className="flex flex-col gap-1">
          {results.map((result, index) => (
            <SearchResultCard
              key={`${result.type}-${result.id}`}
              id={`${listId}-opt-${index}`}
              result={result}
              query={query}
              asOption
              active={activeIndex === index}
              onMouseEnter={onActiveChange ? () => onActiveChange(index) : undefined}
              onSelect={onSelect ? () => onSelect(result) : undefined}
            />
          ))}
        </div>
        {loadingMore}
        {hasMore && onLoadMore ? <InfiniteSentinel onVisible={onLoadMore} /> : null}
      </div>
    );
  }

  const list = (items: SearchResult[], label: string) => (
    <ul aria-label={label} className="flex flex-col gap-2">
      {items.map((result) => (
        <li key={`${result.type}-${result.id}`} className="min-w-0">
          <SearchResultCard result={result} query={query} onSelect={onSelect ? () => onSelect(result) : undefined} />
        </li>
      ))}
    </ul>
  );

  const groups = grouped
    ? ALL_RESOURCE_TYPES.map((type) => ({ type, items: results.filter((result) => result.type === type) })).filter(
        (group) => group.items.length > 0,
      )
    : [];

  return (
    <div className={cn("flex flex-col gap-5", loading && "opacity-60 transition-opacity", className)}>
      {groups.length > 1 ? (
        groups.map((group) => (
          <section key={group.type} aria-labelledby={`results-${group.type}`} className="flex flex-col gap-2">
            <h2 id={`results-${group.type}`} className="text-sm font-medium text-muted-foreground">
              {GROUP_TITLES[group.type]}
            </h2>
            {list(group.items, GROUP_TITLES[group.type])}
          </section>
        ))
      ) : (
        list(results, "Search results")
      )}

      {loadingMore}

      {onPageChange ? <SearchPagination page={page} totalPages={totalPages} onPageChange={onPageChange} /> : null}
    </div>
  );
}
