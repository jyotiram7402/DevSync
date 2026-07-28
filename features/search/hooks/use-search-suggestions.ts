"use client";

import { useEffect, useRef, useState } from "react";

import { suggestAction } from "@/features/search/actions";
import { SUGGESTION_DEBOUNCE_MS } from "@/features/search/constants";
import { useDebouncedValue } from "@/features/search/hooks/use-debounced-value";
import type { SearchSuggestion } from "@/features/search/types";

export interface SuggestionsApi {
  suggestions: SearchSuggestion[];
  loading: boolean;
}

/** Debounced typeahead suggestions for the current term. */
export function useSearchSuggestions(term: string): SuggestionsApi {
  const debounced = useDebouncedValue(term, SUGGESTION_DEBOUNCE_MS);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = debounced.trim();
    if (trimmed.length === 0) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    void suggestAction(trimmed).then((result) => {
      if (requestId !== requestIdRef.current) return;
      setSuggestions(result.ok ? result.data : []);
      setLoading(false);
    });
  }, [debounced]);

  return { suggestions, loading };
}
