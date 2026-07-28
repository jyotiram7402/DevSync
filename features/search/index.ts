/**
 * Global Search Platform — public surface (client-safe). Server-only services
 * (search-service, search-repository, suggestion-service) and Server Actions
 * are imported from their own paths.
 */
export * from "@/features/search/types";
export * from "@/features/search/constants";

export { SearchProvider, useSearchModal } from "@/features/search/search-provider";

export { GlobalSearchBar } from "@/features/search/components/global-search-bar";
export { SearchModal } from "@/features/search/components/search-modal";
export { SearchResults } from "@/features/search/components/search-results";
export { SearchResultCard } from "@/features/search/components/search-result-card";
export { SearchTabs } from "@/features/search/components/search-tabs";
export { SortSelector } from "@/features/search/components/sort-selector";
export { SearchFilters } from "@/features/search/components/search-filters";
export { FilterPanel } from "@/features/search/components/filter-panel";
export { SearchPagination } from "@/features/search/components/search-pagination";
export { SearchHighlight } from "@/features/search/components/search-highlight";
export { SearchEmptyState } from "@/features/search/components/search-empty-state";
export { SearchLoading } from "@/features/search/components/search-loading";
export { SearchSuggestions } from "@/features/search/components/search-suggestions";
export { RecentSearches } from "@/features/search/components/recent-searches";
export { SavedSearches } from "@/features/search/components/saved-searches";
export { KeyboardShortcutHint } from "@/features/search/components/keyboard-shortcut-hint";
export { SearchWorkspace } from "@/features/search/components/search-workspace";

export { useSearch } from "@/features/search/hooks/use-search";
export { useDebouncedValue } from "@/features/search/hooks/use-debounced-value";
export { useRecentSearches } from "@/features/search/hooks/use-recent-searches";
export { useSavedSearches } from "@/features/search/hooks/use-saved-searches";
export { useSearchSuggestions } from "@/features/search/hooks/use-search-suggestions";
export { useSearchShortcuts } from "@/features/search/hooks/use-search-shortcuts";
export { useSearchNavigation } from "@/features/search/hooks/use-search-navigation";
