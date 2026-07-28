import { tokenize } from "@/features/search/services/query-builder";
import {
  aggregateTags,
  collectionToResult,
  projectToResult,
  snippetToResult,
} from "@/features/search/services/search-indexer";
import { applyScores, rankResults } from "@/features/search/services/search-ranking-service";
import type { SearchResult } from "@/features/search/types";
import { supabase } from "~/lib/supabase";

/**
 * Global search on mobile — REUSES the shared pure search engine (tokenize +
 * indexer + ranking) over the same tables. Covers snippets, projects,
 * collections, and tags. RLS scopes results; input is sanitized for ILIKE.
 */
const PER_TYPE_LIMIT = 20;

function sanitize(term: string): string {
  return term
    .replace(/[,()*%\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function search(workspaceId: string, term: string): Promise<SearchResult[]> {
  const query = term.trim();
  if (query.length === 0) return [];
  const tokens = tokenize(query);
  const safe = sanitize(query);
  if (safe.length === 0) return [];

  const results: SearchResult[] = [];

  const [snippets, projects, collections, tagRows] = await Promise.all([
    supabase
      .from("snippets")
      .select("*")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .eq("archived", false)
      .or(`title.ilike.*${safe}*,content.ilike.*${safe}*`)
      .order("updated_at", { ascending: false })
      .limit(PER_TYPE_LIMIT),
    supabase
      .from("projects")
      .select("*")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .eq("is_archived", false)
      .or(`name.ilike.*${safe}*,description.ilike.*${safe}*`)
      .limit(PER_TYPE_LIMIT),
    supabase
      .from("collections")
      .select("*")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .or(`name.ilike.*${safe}*,description.ilike.*${safe}*`)
      .limit(PER_TYPE_LIMIT),
    supabase
      .from("snippets")
      .select("tags")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .eq("archived", false)
      .limit(500),
  ]);

  for (const row of snippets.data ?? []) results.push(snippetToResult(row, tokens));
  for (const row of projects.data ?? []) results.push(projectToResult(row, tokens));
  for (const row of collections.data ?? []) results.push(collectionToResult(row, tokens));
  results.push(...aggregateTags((tagRows.data ?? []).map((row) => row.tags), tokens, PER_TYPE_LIMIT));

  return rankResults(applyScores(results, tokens, query), "relevance");
}
