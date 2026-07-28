"use client";

import { useCallback, useEffect, useState } from "react";

import { searchHistory } from "@/features/search/services/search-history-service";
import type { RecentSearch } from "@/features/search/types";

export interface RecentSearchesApi {
  recent: RecentSearch[];
  add: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
}

/** Recent searches persisted on this device (localStorage). */
export function useRecentSearches(): RecentSearchesApi {
  const [recent, setRecent] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setRecent(searchHistory.listRecent());
  }, []);

  const add = useCallback((query: string) => setRecent(searchHistory.addRecent(query)), []);
  const remove = useCallback((query: string) => setRecent(searchHistory.removeRecent(query)), []);
  const clear = useCallback(() => {
    searchHistory.clearRecent();
    setRecent([]);
  }, []);

  return { recent, add, remove, clear };
}
