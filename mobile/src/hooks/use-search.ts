import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { SearchResult } from "@/features/search/types";
import { useDebounced } from "~/hooks/use-debounced";
import { useWorkspace } from "~/hooks/use-home-data";
import { search } from "~/services/search-service";

export function useSearch() {
  const [term, setTerm] = useState("");
  const debounced = useDebounced(term, 250);
  const workspace = useWorkspace();
  const workspaceId = workspace.data?.id ?? null;

  const query = useQuery<SearchResult[]>({
    queryKey: ["search", workspaceId, debounced.trim()],
    queryFn: () =>
      workspaceId && debounced.trim().length > 0
        ? search(workspaceId, debounced.trim())
        : Promise.resolve([]),
    enabled: Boolean(workspaceId) && debounced.trim().length > 0,
  });

  return {
    term,
    setTerm,
    results: query.data ?? [],
    loading: query.isFetching,
    hasQuery: debounced.trim().length > 0,
  };
}
