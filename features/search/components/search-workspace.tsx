"use client";

import { useRouter } from "next/navigation";
import { Bookmark, Search as SearchIcon } from "lucide-react";
import { useEffect } from "react";

import { FilterPanel } from "@/features/search/components/filter-panel";
import { SavedSearches } from "@/features/search/components/saved-searches";
import { SearchResults } from "@/features/search/components/search-results";
import { SearchTabs } from "@/features/search/components/search-tabs";
import { SortSelector } from "@/features/search/components/sort-selector";
import { DEFAULT_SEARCH_SORT, SEARCH_ROUTE } from "@/features/search/constants";
import { useSavedSearches } from "@/features/search/hooks/use-saved-searches";
import { useSearch, type TabValue } from "@/features/search/hooks/use-search";
import { filtersToQueryRecord } from "@/features/search/services/filter-builder";
import type { SearchFilters, SearchSortKey } from "@/features/search/types";
import type { SelectOption } from "@/features/snippets/types";
import { Button } from "@/components/ui/button";

export interface SearchWorkspaceProps {
  initialQuery: string;
  initialType: TabValue;
  initialSort: SearchSortKey;
  initialFilters: SearchFilters;
  projectOptions: SelectOption[];
  collectionOptions: SelectOption[];
}

/**
 * SearchWorkspace — the full results page experience: query box, tabs, filters,
 * sort, paginated results, and saved searches. Keeps the URL in sync so results
 * are shareable and reloadable.
 */
export function SearchWorkspace({
  initialQuery,
  initialType,
  initialSort,
  initialFilters,
  projectOptions,
  collectionOptions,
}: SearchWorkspaceProps) {
  const router = useRouter();
  const saved = useSavedSearches();

  const search = useSearch({
    initialQuery,
    initialType,
    initialSort,
    initialFilters,
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

  // Keep the URL shareable/reloadable.
  useEffect(() => {
    const url = new URLSearchParams();
    if (query.trim()) url.set("query", query.trim());
    if (activeType !== "all") url.set("types", activeType);
    if (sort !== DEFAULT_SEARCH_SORT) url.set("sort", sort);
    for (const [key, value] of Object.entries(filtersToQueryRecord(filters))) {
      url.set(key, value);
    }
    const queryString = url.toString();
    router.replace(queryString ? `${SEARCH_ROUTE}?${queryString}` : SEARCH_ROUTE, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeType, sort, JSON.stringify(filters)]);

  function saveCurrent() {
    const name = query.trim().length > 0 ? query.trim() : "All results";
    saved.save({ name, query: params.query, types: params.types, sort, filters });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-11 w-full items-center gap-2 rounded-lg border bg-background px-3">
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          aria-label="Search"
          placeholder="Search snippets, projects, collections, and tags…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <SearchTabs active={activeType} counts={counts} onChange={setActiveType} />
        <div className="flex items-center gap-2">
          <SortSelector value={sort} onChange={setSort} />
          <Button type="button" variant="outline" size="sm" onClick={saveCurrent} className="gap-1.5">
            <Bookmark className="size-4" aria-hidden="true" />
            Save
          </Button>
        </div>
      </div>

      <FilterPanel
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        projectOptions={projectOptions}
        collectionOptions={collectionOptions}
      />

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
        {loading ? "Searching…" : `${total} ${total === 1 ? "result" : "results"}`}
      </p>

      <SearchResults
        results={results}
        query={query}
        loading={loading}
        error={error}
        hasQuery={query.trim().length > 0}
        variant="page"
        page={page}
        totalPages={totalPages}
        onPageChange={search.goToPage}
      />
    </div>
  );
}
