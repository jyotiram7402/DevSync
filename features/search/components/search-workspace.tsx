"use client";

import { Bookmark, Search as SearchIcon, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { FilterPanel } from "@/features/search/components/filter-panel";
import { SavedSearches } from "@/features/search/components/saved-searches";
import { SearchResults } from "@/features/search/components/search-results";
import { SearchTabs } from "@/features/search/components/search-tabs";
import { SortSelector } from "@/features/search/components/sort-selector";
import {
  ALL_RESOURCE_TYPES,
  DEFAULT_SEARCH_SORT,
  SEARCH_CANDIDATE_LIMIT,
  SEARCH_PAGE_SIZE,
  SEARCH_ROUTE,
} from "@/features/search/constants";
import { useSavedSearches } from "@/features/search/hooks/use-saved-searches";
import { useSearch, type TabValue } from "@/features/search/hooks/use-search";
import { filtersToQueryRecord, hasActiveFilters } from "@/features/search/services/filter-builder";
import type { SearchFilters, SearchResourceType, SearchSortKey } from "@/features/search/types";
import type { SelectOption } from "@/features/snippets/types";

export interface SearchWorkspaceProps {
  initialQuery: string;
  initialType: TabValue;
  initialSort: SearchSortKey;
  initialFilters: SearchFilters;
  initialPage: number;
  projectOptions: SelectOption[];
  collectionOptions: SelectOption[];
}

/**
 * SearchWorkspace — the full results page: search box, type tabs (one
 * scrolling row), sort, filters, saved searches and the results, grouped by
 * type on "All". The address bar follows along (debounced, without reloading
 * the page) so a search can be shared or reloaded.
 */
export function SearchWorkspace({
  initialQuery,
  initialType,
  initialSort,
  initialFilters,
  initialPage,
  projectOptions,
  collectionOptions,
}: SearchWorkspaceProps) {
  const saved = useSavedSearches();
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useSearch({
    initialQuery,
    initialType,
    initialSort,
    initialFilters,
    initialPage,
    searchOnEmpty: true,
  });

  const {
    query,
    setQuery,
    activeType,
    setActiveType,
    sort,
    setSort,
    filters,
    setFilters,
    clearFilters,
    results,
    counts,
    total,
    page,
    totalPages,
    loading,
    error,
    params,
  } = search;
  const filtersKey = JSON.stringify(filtersToQueryRecord(filters));
  const filtering = hasActiveFilters(filters);

  // With a mouse and an empty box, start typing right away (on phones the keyboard would pop up).
  useEffect(() => {
    if (initialQuery.length === 0 && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, [initialQuery]);

  // Keep the URL shareable and reloadable. replaceState updates the address
  // (and useSearchParams) without asking the server for the page again.
  useEffect(() => {
    const url = new URLSearchParams();
    if (params.query) url.set("query", params.query);
    if (activeType !== "all") url.set("types", activeType);
    if (sort !== DEFAULT_SEARCH_SORT) url.set("sort", sort);
    if (page > 1) url.set("page", String(page));
    for (const [key, value] of Object.entries(filtersToQueryRecord(filters))) url.set(key, value);
    const queryString = url.toString();
    const next = queryString ? `${SEARCH_ROUTE}?${queryString}` : SEARCH_ROUTE;
    if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.query, activeType, sort, page, filtersKey]);

  // Mixed or relevance-ranked searches rank the top matches of each type, so
  // only those pages exist even when more items match.
  const ranked = activeType === "all" || activeType === "tag" || sort === "relevance";
  const searchedTypes: readonly SearchResourceType[] = activeType === "all" ? ALL_RESOURCE_TYPES : [activeType];
  const reachable = ranked
    ? searchedTypes.reduce((sum, type) => sum + Math.min(counts[type], SEARCH_CANDIDATE_LIMIT), 0)
    : total;
  const pages = Math.max(1, Math.min(totalPages, Math.ceil(reachable / SEARCH_PAGE_SIZE)));
  const capped = reachable < total;

  function saveCurrent() {
    const signature = JSON.stringify([params.query, params.types, sort, filtersToQueryRecord(filters)]);
    const exists = saved.saved.some(
      (entry) =>
        JSON.stringify([entry.query, entry.types, entry.sort, filtersToQueryRecord(entry.filters)]) === signature,
    );
    if (exists) {
      toast("This search is already saved.");
      return;
    }
    saved.save({ name: params.query || "All results", query: params.query, types: params.types, sort, filters });
    toast.success("Search saved. It's under Saved searches.");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-12 w-full items-center gap-2 rounded-lg border border-input bg-surface pl-3 pr-1 transition-colors duration-fast focus-within:border-ring focus-within:outline focus-within:outline-2 focus-within:outline-ring">
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search"
          placeholder="Search snippets, projects and tags"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="search"
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm [&::-webkit-search-cancel-button]:hidden"
        />
        {query.length > 0 ? (
          <IconButton
            label="Clear search"
            icon={X}
            size="sm"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="shrink-0"
          />
        ) : null}
      </div>

      <SearchTabs active={activeType} counts={counts} onChange={setActiveType} />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          projectOptions={projectOptions}
          collectionOptions={collectionOptions}
          className="min-w-0 sm:flex-1"
        />
        <div className="flex items-center gap-2">
          <SortSelector value={sort} onChange={setSort} className="flex-1 sm:flex-none" />
          <Button type="button" variant="outline" onClick={saveCurrent} className="shrink-0">
            <Bookmark aria-hidden="true" />
            Save search
          </Button>
        </div>
      </div>

      {saved.saved.length > 0 ? (
        <SavedSearches
          saved={saved.saved}
          onApply={(entry) => {
            const onlyType = entry.types.length === 1 ? entry.types[0] : undefined;
            setQuery(entry.query);
            setActiveType(onlyType ?? "all");
            setSort(entry.sort);
            setFilters(entry.filters);
          }}
          onRemove={saved.remove}
        />
      ) : null}

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {loading
          ? "Searching…"
          : error
            ? ""
            : capped
              ? `Showing the top ${reachable} of ${total} matches. Add a word or a filter to narrow it down.`
              : `${total} ${total === 1 ? "result" : "results"}`}
      </p>

      <SearchResults
        results={results}
        query={query}
        loading={loading}
        error={error}
        hasQuery={query.trim().length > 0 || filtering}
        variant="page"
        grouped={activeType === "all"}
        page={page}
        totalPages={pages}
        onPageChange={(next) => {
          search.goToPage(next);
          window.scrollTo({ top: 0 });
        }}
        onRetry={search.refresh}
        {...(filtering ? { onClearFilters: clearFilters } : {})}
      />
    </div>
  );
}
