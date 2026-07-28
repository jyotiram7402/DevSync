import "server-only";

import { SEARCH_CANDIDATE_LIMIT, TAG_SCAN_CAP } from "@/features/search/constants";
import { tokenize } from "@/features/search/services/query-builder";
import {
  aggregateTags,
  collectionToResult,
  projectToResult,
  snippetToResult,
} from "@/features/search/services/search-indexer";
import { applyScores, rankResults } from "@/features/search/services/search-ranking-service";
import * as repository from "@/features/search/services/search-repository";
import type {
  ResourceCounts,
  SearchParams,
  SearchResponse,
  SearchResult,
} from "@/features/search/types";
import type { SelectOption } from "@/features/snippets/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionError, ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";

/**
 * SearchService — server-side orchestration for the global search platform.
 * Resolves the workspace, fans out to the repository per resource type,
 * normalizes + ranks results, paginates, and returns the ActionResult contract.
 * RLS enforces isolation; this adds workspace scoping and friendly errors.
 */
const NO_WORKSPACE: ActionError = {
  code: "NOT_FOUND",
  message: "No workspace found for your account.",
};

function toActionError(error: unknown): ActionError {
  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";
  if (/row-level security|violates row-level|permission denied/i.test(message)) {
    return { code: "FORBIDDEN", message: "You do not have permission to search that." };
  }
  // eslint-disable-next-line no-console
  console.error("[search] service error:", message);
  return { code: "INTERNAL", message: "Search failed. Please try again." };
}

function emptyCounts(): ResourceCounts {
  return { snippet: 0, project: 0, collection: 0, tag: 0 };
}

export async function search(params: SearchParams): Promise<ActionResult<SearchResponse>> {
  const started = Date.now();
  const client = await createServerSupabaseClient();

  try {
    const context = await repository.resolveSearchContext(client);
    if (!context) return err(NO_WORKSPACE);

    const { workspaceId } = context;
    const tokens = tokenize(params.query);
    const counts = emptyCounts();
    const hasQuery = params.query.trim().length > 0;

    // Cross-type or relevance ordering, and tag results, are ranked/sliced in
    // memory; a single non-relevance type paginates directly in the database.
    const merge =
      params.types.length > 1 || params.sort === "relevance" || params.types.includes("tag");
    const from = merge ? 0 : (params.page - 1) * params.pageSize;
    const to = merge ? SEARCH_CANDIDATE_LIMIT - 1 : from + params.pageSize - 1;

    // Collection filter narrows snippets to that collection's members.
    let restrictIds: string[] | undefined;
    if (params.filters.collectionId !== undefined && params.types.includes("snippet")) {
      restrictIds = await repository.getCollectionSnippetIds(client, params.filters.collectionId);
    }

    let collected: SearchResult[] = [];

    if (params.types.includes("snippet")) {
      const args: repository.ResourceQueryArgs = {
        workspaceId,
        term: params.query,
        filters: params.filters,
        sort: params.sort,
        from,
        to,
        ...(restrictIds !== undefined ? { restrictIds } : {}),
      };
      let result = await repository.searchSnippetRows(client, args);
      // FTS may miss short/symbolic queries — fall back to ILIKE.
      if (result.rows.length === 0 && hasQuery) {
        result = await repository.searchSnippetRows(client, { ...args, forceIlike: true });
      }
      counts.snippet = result.count;
      collected = collected.concat(result.rows.map((row) => snippetToResult(row, tokens)));
    }

    if (params.types.includes("project")) {
      const result = await repository.searchProjectRows(client, {
        workspaceId,
        term: params.query,
        filters: params.filters,
        sort: params.sort,
        from,
        to,
      });
      counts.project = result.count;
      collected = collected.concat(result.rows.map((row) => projectToResult(row, tokens)));
    }

    if (params.types.includes("collection")) {
      const result = await repository.searchCollectionRows(client, {
        workspaceId,
        term: params.query,
        filters: params.filters,
        sort: params.sort,
        from,
        to,
      });
      counts.collection = result.count;
      collected = collected.concat(result.rows.map((row) => collectionToResult(row, tokens)));
    }

    if (params.types.includes("tag")) {
      const includeArchived = params.filters.archived === true;
      const tagRows = await repository.fetchWorkspaceTagRows(
        client,
        workspaceId,
        includeArchived,
        TAG_SCAN_CAP,
      );
      const tagResults = aggregateTags(
        tagRows.map((row) => row.tags),
        tokens,
        SEARCH_CANDIDATE_LIMIT,
      );
      counts.tag = tagResults.length;
      collected = collected.concat(tagResults);
    }

    const ranked = rankResults(applyScores(collected, tokens, params.query), params.sort);
    const total = counts.snippet + counts.project + counts.collection + counts.tag;

    const results = merge
      ? ranked.slice((params.page - 1) * params.pageSize, params.page * params.pageSize)
      : ranked;

    const response: SearchResponse = {
      query: params.query,
      scope: params.scope,
      results,
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
      counts,
      tookMs: Date.now() - started,
    };
    return ok(response);
  } catch (error) {
    return err(toActionError(error));
  }
}

/** Filter dropdown options (projects + collections) for the results page. */
export async function getFilterOptions(): Promise<
  ActionResult<{ projects: SelectOption[]; collections: SelectOption[] }>
> {
  const client = await createServerSupabaseClient();
  try {
    const context = await repository.resolveSearchContext(client);
    if (!context) return ok({ projects: [], collections: [] });

    const [projectsResult, collectionsResult] = await Promise.all([
      client
        .from("projects")
        .select("id,name")
        .eq("workspace_id", context.workspaceId)
        .eq("is_archived", false)
        .is("deleted_at", null)
        .order("name", { ascending: true }),
      client
        .from("collections")
        .select("id,name")
        .eq("workspace_id", context.workspaceId)
        .is("deleted_at", null)
        .order("name", { ascending: true }),
    ]);

    return ok({
      projects: (projectsResult.data ?? []).map((row) => ({ id: row.id, name: row.name })),
      collections: (collectionsResult.data ?? []).map((row) => ({ id: row.id, name: row.name })),
    });
  } catch (error) {
    return err(toActionError(error));
  }
}
