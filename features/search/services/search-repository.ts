import "server-only";

import {
  sanitizeIlikeTerm,
  shouldUseFts,
  toWebSearchQuery,
} from "@/features/search/services/query-builder";
import type { SearchFilters, SearchSortKey } from "@/features/search/types";
import type { WorkspaceRole } from "@/features/snippets/types";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Tables } from "@/types/database";

/**
 * SearchRepository — the only layer that issues search queries. Returns raw
 * rows + exact counts and throws on DB errors (the service maps to
 * ActionResult). Every query is workspace-scoped; RLS is the real boundary.
 *
 * Ordering is applied inline (filters first, then `.order()`, then `.range()`)
 * — the same shape as snippet-repository — so it stays correct regardless of
 * how the Supabase builder narrows its return type across versions.
 */
const SNIPPET_SELECT =
  "id,workspace_id,project_id,title,content,language,type,tags,pinned,favorite,archived,visibility,source_device_id,created_by,updated_by,metadata,created_at,updated_at,deleted_at" as const;
const PROJECT_SELECT =
  "id,workspace_id,name,description,icon,color,is_default,is_favorite,is_pinned,is_archived,created_by,updated_by,created_at,updated_at,deleted_at" as const;
const COLLECTION_SELECT =
  "id,workspace_id,name,description,color,created_by,created_at,updated_at,deleted_at" as const;

export interface SearchContext {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
}

export async function resolveSearchContext(
  client: TypedSupabaseClient,
): Promise<SearchContext | null> {
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data, error } = await client
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_personal", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { userId: user.id, workspaceId: data.id, role: "owner" };
}

export interface ResourceQueryArgs {
  workspaceId: string;
  term: string;
  filters: SearchFilters;
  sort: SearchSortKey;
  from: number;
  to: number;
  /** Restrict to a specific id set (used by the collection filter for snippets). */
  restrictIds?: string[];
  /** Force ILIKE instead of full-text search (fallback path). */
  forceIlike?: boolean;
}

export async function getCollectionSnippetIds(
  client: TypedSupabaseClient,
  collectionId: string,
): Promise<string[]> {
  const { data, error } = await client
    .from("snippet_collections")
    .select("snippet_id")
    .eq("collection_id", collectionId);
  if (error) throw error;
  return (data ?? []).map((row) => row.snippet_id);
}

export async function searchSnippetRows(
  client: TypedSupabaseClient,
  args: ResourceQueryArgs,
): Promise<{ rows: Tables<"snippets">[]; count: number }> {
  const { filters } = args;
  let filtered = client
    .from("snippets")
    .select(SNIPPET_SELECT, { count: "exact" })
    .eq("workspace_id", args.workspaceId)
    .is("deleted_at", null)
    .eq("archived", filters.archived ?? false);

  if (args.restrictIds !== undefined) {
    if (args.restrictIds.length === 0) return { rows: [], count: 0 };
    filtered = filtered.in("id", args.restrictIds);
  }
  if (filters.projectId !== undefined) filtered = filtered.eq("project_id", filters.projectId);
  if (filters.language !== undefined) filtered = filtered.eq("language", filters.language);
  if (filters.visibility !== undefined) filtered = filtered.eq("visibility", filters.visibility);
  if (filters.favorite !== undefined) filtered = filtered.eq("favorite", filters.favorite);
  if (filters.pinned !== undefined) filtered = filtered.eq("pinned", filters.pinned);
  if (filters.createdBy !== undefined) filtered = filtered.eq("created_by", filters.createdBy);
  if (filters.updatedBy !== undefined) filtered = filtered.eq("updated_by", filters.updatedBy);
  if (filters.tag !== undefined) filtered = filtered.contains("tags", [filters.tag]);
  if (filters.createdAfter !== undefined) filtered = filtered.gte("created_at", filters.createdAfter);
  if (filters.createdBefore !== undefined) filtered = filtered.lte("created_at", filters.createdBefore);
  if (filters.updatedAfter !== undefined) filtered = filtered.gte("updated_at", filters.updatedAfter);
  if (filters.updatedBefore !== undefined) filtered = filtered.lte("updated_at", filters.updatedBefore);

  const term = args.term.trim();
  if (term.length > 0) {
    if (!args.forceIlike && shouldUseFts(term)) {
      filtered = filtered.textSearch("search_vector", toWebSearchQuery(term), {
        type: "websearch",
        config: "english",
      });
    } else {
      const safe = sanitizeIlikeTerm(term);
      if (safe.length > 0) filtered = filtered.or(`title.ilike.*${safe}*,content.ilike.*${safe}*`);
    }
  }

  let ordered = filtered.order("pinned", { ascending: false });
  switch (args.sort) {
    case "alphabetical":
      ordered = ordered.order("title", { ascending: true, nullsFirst: false });
      break;
    case "created":
      ordered = ordered.order("created_at", { ascending: false });
      break;
    case "favorites":
      ordered = ordered.order("favorite", { ascending: false });
      ordered = ordered.order("updated_at", { ascending: false });
      break;
    default:
      ordered = ordered.order("updated_at", { ascending: false });
      break;
  }

  const { data, error, count } = await ordered.range(args.from, args.to);
  if (error) throw error;
  return { rows: data ?? [], count: count ?? 0 };
}

export async function searchProjectRows(
  client: TypedSupabaseClient,
  args: ResourceQueryArgs,
): Promise<{ rows: Tables<"projects">[]; count: number }> {
  const { filters } = args;
  let filtered = client
    .from("projects")
    .select(PROJECT_SELECT, { count: "exact" })
    .eq("workspace_id", args.workspaceId)
    .is("deleted_at", null)
    .eq("is_archived", filters.archived ?? false);

  if (filters.favorite !== undefined) filtered = filtered.eq("is_favorite", filters.favorite);
  if (filters.pinned !== undefined) filtered = filtered.eq("is_pinned", filters.pinned);
  if (filters.createdBy !== undefined) filtered = filtered.eq("created_by", filters.createdBy);
  if (filters.updatedBy !== undefined) filtered = filtered.eq("updated_by", filters.updatedBy);
  if (filters.createdAfter !== undefined) filtered = filtered.gte("created_at", filters.createdAfter);
  if (filters.createdBefore !== undefined) filtered = filtered.lte("created_at", filters.createdBefore);
  if (filters.updatedAfter !== undefined) filtered = filtered.gte("updated_at", filters.updatedAfter);
  if (filters.updatedBefore !== undefined) filtered = filtered.lte("updated_at", filters.updatedBefore);

  const safe = sanitizeIlikeTerm(args.term);
  if (safe.length > 0) filtered = filtered.or(`name.ilike.*${safe}*,description.ilike.*${safe}*`);

  let ordered = filtered.order("is_pinned", { ascending: false });
  switch (args.sort) {
    case "alphabetical":
      ordered = ordered.order("name", { ascending: true, nullsFirst: false });
      break;
    case "created":
      ordered = ordered.order("created_at", { ascending: false });
      break;
    case "favorites":
      ordered = ordered.order("is_favorite", { ascending: false });
      ordered = ordered.order("updated_at", { ascending: false });
      break;
    default:
      ordered = ordered.order("updated_at", { ascending: false });
      break;
  }

  const { data, error, count } = await ordered.range(args.from, args.to);
  if (error) throw error;
  return { rows: data ?? [], count: count ?? 0 };
}

export async function searchCollectionRows(
  client: TypedSupabaseClient,
  args: ResourceQueryArgs,
): Promise<{ rows: Tables<"collections">[]; count: number }> {
  const { filters } = args;
  let filtered = client
    .from("collections")
    .select(COLLECTION_SELECT, { count: "exact" })
    .eq("workspace_id", args.workspaceId)
    .is("deleted_at", null);

  if (filters.createdBy !== undefined) filtered = filtered.eq("created_by", filters.createdBy);
  if (filters.createdAfter !== undefined) filtered = filtered.gte("created_at", filters.createdAfter);
  if (filters.createdBefore !== undefined) filtered = filtered.lte("created_at", filters.createdBefore);
  if (filters.updatedAfter !== undefined) filtered = filtered.gte("updated_at", filters.updatedAfter);
  if (filters.updatedBefore !== undefined) filtered = filtered.lte("updated_at", filters.updatedBefore);

  const safe = sanitizeIlikeTerm(args.term);
  if (safe.length > 0) filtered = filtered.or(`name.ilike.*${safe}*,description.ilike.*${safe}*`);

  let ordered = filtered.order("updated_at", { ascending: false });
  if (args.sort === "alphabetical") {
    ordered = filtered.order("name", { ascending: true });
  } else if (args.sort === "created") {
    ordered = filtered.order("created_at", { ascending: false });
  }

  const { data, error, count } = await ordered.range(args.from, args.to);
  if (error) throw error;
  return { rows: data ?? [], count: count ?? 0 };
}

export async function fetchWorkspaceTagRows(
  client: TypedSupabaseClient,
  workspaceId: string,
  includeArchived: boolean,
  cap: number,
): Promise<{ tags: string[] }[]> {
  let filtered = client
    .from("snippets")
    .select("tags")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null);
  if (!includeArchived) filtered = filtered.eq("archived", false);

  const { data, error } = await filtered.limit(cap);
  if (error) throw error;
  return data ?? [];
}
