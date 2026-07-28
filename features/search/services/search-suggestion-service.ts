import "server-only";

import { MAX_SUGGESTIONS, SEARCH_ROUTE, TAG_SCAN_CAP } from "@/features/search/constants";
import { sanitizeIlikeTerm, tokenize } from "@/features/search/services/query-builder";
import { aggregateTags } from "@/features/search/services/search-indexer";
import { fetchWorkspaceTagRows, resolveSearchContext } from "@/features/search/services/search-repository";
import type { SearchSuggestion } from "@/features/search/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";

/**
 * SearchSuggestionService — lightweight, typeahead-oriented lookups. Returns a
 * few best-matching entities per type for the suggestion dropdown; the full
 * ranked search runs separately via SearchService. Workspace-scoped + RLS.
 */
export async function getSuggestions(term: string): Promise<ActionResult<SearchSuggestion[]>> {
  const trimmed = term.trim();
  if (trimmed.length === 0) return ok([]);

  const client = await createServerSupabaseClient();
  try {
    const context = await resolveSearchContext(client);
    if (!context) return ok([]);
    const { workspaceId } = context;
    const safe = sanitizeIlikeTerm(trimmed);
    if (safe.length === 0) return ok([]);

    const suggestions: SearchSuggestion[] = [];

    const { data: snippets } = await client
      .from("snippets")
      .select("id,title")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .eq("archived", false)
      .ilike("title", `%${safe}%`)
      .not("title", "is", null)
      .limit(4);
    for (const row of snippets ?? []) {
      if (row.title) {
        suggestions.push({ type: "snippet", label: row.title, href: `/dashboard/snippets/${row.id}` });
      }
    }

    const { data: projects } = await client
      .from("projects")
      .select("id,name")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .eq("is_archived", false)
      .ilike("name", `%${safe}%`)
      .limit(3);
    for (const row of projects ?? []) {
      suggestions.push({ type: "project", label: row.name, href: `/dashboard/projects/${row.id}` });
    }

    const { data: collections } = await client
      .from("collections")
      .select("id,name")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .ilike("name", `%${safe}%`)
      .limit(3);
    for (const row of collections ?? []) {
      suggestions.push({ type: "collection", label: row.name, href: `/dashboard/collections` });
    }

    const tagRows = await fetchWorkspaceTagRows(client, workspaceId, false, TAG_SCAN_CAP);
    const tags = aggregateTags(tagRows.map((row) => row.tags), tokenize(trimmed), 3);
    for (const tag of tags) {
      suggestions.push({
        type: "tag",
        label: tag.title,
        href: `${SEARCH_ROUTE}?query=${encodeURIComponent(tag.title)}&types=snippet&tag=${encodeURIComponent(tag.title)}`,
      });
    }

    return ok(suggestions.slice(0, MAX_SUGGESTIONS));
  } catch {
    // Suggestions are best-effort; never surface an error toast for typeahead.
    return err({ code: "INTERNAL", message: "Suggestions unavailable." });
  }
}
