"use server";

import { parseSearchParams, type RawSearchInput } from "@/features/search/schemas";
import { search } from "@/features/search/services/search-service";
import { getSuggestions } from "@/features/search/services/search-suggestion-service";
import type { SearchResponse, SearchSuggestion } from "@/features/search/types";
import type { ActionResult } from "@/types/api";

/**
 * Search Server Actions — the client entry points. Input is always re-validated
 * server-side via parseSearchParams (never trust the caller). RLS + workspace
 * scoping enforce isolation inside the service.
 */
export async function searchAction(input: RawSearchInput): Promise<ActionResult<SearchResponse>> {
  return search(parseSearchParams(input));
}

export async function suggestAction(term: string): Promise<ActionResult<SearchSuggestion[]>> {
  return getSuggestions(typeof term === "string" ? term : "");
}
