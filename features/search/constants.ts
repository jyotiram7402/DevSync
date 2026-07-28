import type { SearchResourceType, SearchScope, SearchSortKey } from "@/features/search/types";

/**
 * Global Search Platform — constants (page sizes, options, storage keys,
 * timings, and keyboard shortcuts). Pure values only.
 */
export const SEARCH_PAGE_SIZE = 20;
export const SEARCH_MAX_PAGE_SIZE = 50;
export const SEARCH_MIN_QUERY_LENGTH = 1;
/** Use Postgres FTS at/above this length; ILIKE prefix below it. */
export const FTS_MIN_QUERY_LENGTH = 3;

export const SEARCH_DEBOUNCE_MS = 250;
export const SUGGESTION_DEBOUNCE_MS = 150;

export const MAX_RECENT_SEARCHES = 8;
export const MAX_SAVED_SEARCHES = 20;
export const MAX_SUGGESTIONS = 8;

/**
 * When results from multiple resource types are merged (or sorted by
 * relevance), we fetch up to this many candidates per type, rank in memory,
 * then slice the requested page. Single-type, non-relevance searches paginate
 * directly in the database for exact deep pagination.
 */
export const SEARCH_CANDIDATE_LIMIT = 100;

/** Max snippet rows scanned when aggregating workspace tags. */
export const TAG_SCAN_CAP = 2000;

export const SEARCH_STORAGE_KEYS = {
  recent: "devsync:search:recent",
  saved: "devsync:search:saved",
} as const;

/** All resource types included when no explicit tab is selected. */
export const ALL_RESOURCE_TYPES: readonly SearchResourceType[] = [
  "snippet",
  "project",
  "collection",
  "tag",
];

export const RESOURCE_TABS: ReadonlyArray<{ value: SearchResourceType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "snippet", label: "Snippets" },
  { value: "project", label: "Projects" },
  { value: "collection", label: "Collections" },
  { value: "tag", label: "Tags" },
];

export const SEARCH_SORT_OPTIONS: ReadonlyArray<{ value: SearchSortKey; label: string }> = [
  { value: "relevance", label: "Relevance" },
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Recently created" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "favorites", label: "Favorites first" },
  { value: "pinned", label: "Pinned first" },
];

export const DEFAULT_SEARCH_SORT: SearchSortKey = "relevance";
export const DEFAULT_SEARCH_SCOPE: SearchScope = "workspace";

export const SEARCH_ROUTE = "/dashboard/search";
