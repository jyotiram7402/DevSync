"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { searchAction } from "@/features/search/actions";
import {
  ALL_RESOURCE_TYPES,
  DEFAULT_SEARCH_SCOPE,
  DEFAULT_SEARCH_SORT,
  SEARCH_DEBOUNCE_MS,
  SEARCH_PAGE_SIZE,
} from "@/features/search/constants";
import { useDebouncedValue } from "@/features/search/hooks/use-debounced-value";
import type {
  ResourceCounts,
  SearchFilters,
  SearchParams,
  SearchResourceType,
  SearchResult,
  SearchScope,
  SearchSortKey,
} from "@/features/search/types";

export type TabValue = SearchResourceType | "all";

export interface UseSearchOptions {
  initialQuery?: string;
  initialType?: TabValue;
  initialSort?: SearchSortKey;
  initialScope?: SearchScope;
  initialFilters?: SearchFilters;
  /** Fire searches even when the query is empty (browse mode). */
  searchOnEmpty?: boolean;
}

const EMPTY_COUNTS: ResourceCounts = { snippet: 0, project: 0, collection: 0, tag: 0 };

export interface UseSearchApi {
  query: string;
  setQuery: (value: string) => void;
  activeType: TabValue;
  setActiveType: (value: TabValue) => void;
  sort: SearchSortKey;
  setSort: (value: SearchSortKey) => void;
  scope: SearchScope;
  setScope: (value: SearchScope) => void;
  filters: SearchFilters;
  setFilters: (value: SearchFilters) => void;
  clearFilters: () => void;
  results: SearchResult[];
  counts: ResourceCounts;
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  goToPage: (page: number) => void;
  refresh: () => void;
  params: SearchParams;
}

/**
 * useSearch — the client search runner. Debounces the query, prevents duplicate
 * and stale requests (request-id guard), and supports both paged and
 * infinite-scroll (append) loading. Powers the modal and the results page.
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchApi {
  const [query, setQuery] = useState(options.initialQuery ?? "");
  const [activeType, setActiveType] = useState<TabValue>(options.initialType ?? "all");
  const [sort, setSort] = useState<SearchSortKey>(options.initialSort ?? DEFAULT_SEARCH_SORT);
  const [scope, setScope] = useState<SearchScope>(options.initialScope ?? DEFAULT_SEARCH_SCOPE);
  const [filters, setFilters] = useState<SearchFilters>(options.initialFilters ?? {});

  const [results, setResults] = useState<SearchResult[]>([]);
  const [counts, setCounts] = useState<ResourceCounts>(EMPTY_COUNTS);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const types = useMemo<SearchResourceType[]>(
    () => (activeType === "all" ? [...ALL_RESOURCE_TYPES] : [activeType]),
    [activeType],
  );
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const requestIdRef = useRef(0);

  const buildParams = useCallback(
    (nextPage: number): SearchParams => ({
      query: debouncedQuery.trim(),
      types,
      scope,
      sort,
      page: nextPage,
      pageSize: SEARCH_PAGE_SIZE,
      filters: filtersRef.current,
    }),
    [debouncedQuery, types, scope, sort],
  );

  const run = useCallback(
    async (nextPage: number, append: boolean) => {
      const trimmed = debouncedQuery.trim();
      if (trimmed.length === 0 && !options.searchOnEmpty) {
        requestIdRef.current += 1;
        setResults([]);
        setCounts(EMPTY_COUNTS);
        setTotal(0);
        setTotalPages(1);
        setPage(1);
        setLoading(false);
        setError(null);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setLoading(true);
      setError(null);

      const result = await searchAction(buildParams(nextPage));
      if (requestId !== requestIdRef.current) return; // stale response

      if (!result.ok) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      const data = result.data;
      setCounts(data.counts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
      setResults((prev) => (append ? [...prev, ...data.results] : data.results));
      setLoading(false);
    },
    [buildParams, debouncedQuery, options.searchOnEmpty],
  );

  // Re-run from page 1 whenever the query, tab, sort, scope, or filters change.
  useEffect(() => {
    void run(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, activeType, sort, scope, filtersKey]);

  const loadMore = useCallback(() => {
    if (loading || page >= totalPages) return;
    void run(page + 1, true);
  }, [loading, page, totalPages, run]);

  const goToPage = useCallback(
    (nextPage: number) => {
      void run(Math.max(1, nextPage), false);
    },
    [run],
  );

  const refresh = useCallback(() => {
    void run(1, false);
  }, [run]);

  const clearFilters = useCallback(() => setFilters({}), []);

  const params = useMemo<SearchParams>(() => buildParams(page), [buildParams, page]);

  return {
    query,
    setQuery,
    activeType,
    setActiveType,
    sort,
    setSort,
    scope,
    setScope,
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
    hasMore: page < totalPages,
    loadMore,
    goToPage,
    refresh,
    params,
  };
}
