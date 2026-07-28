"use client";

import { useCallback, useEffect, useState } from "react";

import { searchHistory } from "@/features/search/services/search-history-service";
import type { SavedSearch } from "@/features/search/types";

export interface SavedSearchesApi {
  saved: SavedSearch[];
  save: (entry: Omit<SavedSearch, "id" | "createdAt">) => void;
  remove: (id: string) => void;
}

/** Named saved searches persisted on this device (localStorage). */
export function useSavedSearches(): SavedSearchesApi {
  const [saved, setSaved] = useState<SavedSearch[]>([]);

  useEffect(() => {
    setSaved(searchHistory.listSaved());
  }, []);

  const save = useCallback(
    (entry: Omit<SavedSearch, "id" | "createdAt">) => setSaved(searchHistory.addSaved(entry)),
    [],
  );
  const remove = useCallback((id: string) => setSaved(searchHistory.removeSaved(id)), []);

  return { saved, save, remove };
}
