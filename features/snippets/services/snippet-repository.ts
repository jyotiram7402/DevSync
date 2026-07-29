import type {
  SnippetListParams,
  SelectOption,
  WorkspaceRole,
} from "@/features/snippets/types";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

/**
 * SnippetRepository — the only layer that issues snippet queries. Returns raw
 * rows and throws on DB errors; the service converts throws to ActionResult.
 * Explicit column selection avoids fetching the generated search_vector.
 */
const SNIPPET_SELECT =
  "id,workspace_id,project_id,title,content,language,type,tags,pinned,favorite,archived,visibility,source_device_id,created_by,updated_by,metadata,created_at,updated_at,deleted_at" as const;

export interface SnippetContext {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
}

export async function resolveContext(client: TypedSupabaseClient): Promise<SnippetContext | null> {
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

interface ListRowsArgs extends Required<Pick<SnippetListParams, "status" | "sort">> {
  workspaceId: string;
  search: string | undefined;
  projectId: string | undefined;
  language: string | undefined;
  from: number;
  to: number;
  /** When true, show only code/text snippets — exclude library kinds
   *  (image/url/pdf/office/file/…), which live in their own type views. */
  contentOnly?: boolean;
}

export async function listSnippetRows(
  client: TypedSupabaseClient,
  args: ListRowsArgs,
): Promise<{ rows: Tables<"snippets">[]; count: number }> {
  let filtered = client
    .from("snippets")
    .select(SNIPPET_SELECT, { count: "exact" })
    .eq("workspace_id", args.workspaceId)
    .is("deleted_at", null)
    .eq("archived", args.status === "archived");

  if (args.projectId) {
    filtered = filtered.eq("project_id", args.projectId);
  }
  if (args.language) {
    filtered = filtered.eq("language", args.language);
  }
  if (args.search) {
    const term = args.search.replace(/[,()*%]/g, " ").trim();
    if (term.length > 0) {
      filtered = filtered.or(`title.ilike.*${term}*,content.ilike.*${term}*`);
    }
  }
  if (args.contentOnly) {
    // Keep only code/text (kind absent/null, or explicitly text/code); items
    // with a library kind (image/url/pdf/office/file/…) are shown in their tabs.
    filtered = filtered.or(
      "metadata->>kind.is.null,metadata->>kind.eq.text,metadata->>kind.eq.code",
    );
  }

  let ordered = filtered.order("pinned", { ascending: false });
  switch (args.sort) {
    case "title":
      ordered = ordered.order("title", { ascending: true, nullsFirst: false });
      break;
    case "created":
      ordered = ordered.order("created_at", { ascending: false });
      break;
    case "favorite":
      ordered = ordered.order("favorite", { ascending: false }).order("updated_at", {
        ascending: false,
      });
      break;
    case "updated":
    default:
      ordered = ordered.order("updated_at", { ascending: false });
      break;
  }

  const { data, error, count } = await ordered.range(args.from, args.to);
  if (error) throw error;
  return { rows: data ?? [], count: count ?? 0 };
}

export async function findSnippetRow(
  client: TypedSupabaseClient,
  workspaceId: string,
  id: string,
): Promise<Tables<"snippets"> | null> {
  const { data, error } = await client
    .from("snippets")
    .select(SNIPPET_SELECT)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getSnippetCollectionIds(
  client: TypedSupabaseClient,
  snippetId: string,
): Promise<string[]> {
  const { data, error } = await client
    .from("snippet_collections")
    .select("collection_id")
    .eq("snippet_id", snippetId);

  if (error) throw error;
  return (data ?? []).map((row) => row.collection_id);
}

export async function insertSnippetRow(
  client: TypedSupabaseClient,
  values: TablesInsert<"snippets">,
): Promise<Tables<"snippets">> {
  const { data, error } = await client
    .from("snippets")
    .insert(values)
    .select(SNIPPET_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function updateSnippetRow(
  client: TypedSupabaseClient,
  workspaceId: string,
  id: string,
  patch: TablesUpdate<"snippets">,
): Promise<Tables<"snippets">> {
  const { data, error } = await client
    .from("snippets")
    .update(patch)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .select(SNIPPET_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSnippetRow(
  client: TypedSupabaseClient,
  workspaceId: string,
  id: string,
): Promise<void> {
  const { error } = await client
    .from("snippets")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);
  if (error) throw error;
}

export async function bulkUpdateSnippetRows(
  client: TypedSupabaseClient,
  workspaceId: string,
  ids: string[],
  patch: TablesUpdate<"snippets">,
): Promise<void> {
  const { error } = await client
    .from("snippets")
    .update(patch)
    .eq("workspace_id", workspaceId)
    .in("id", ids);
  if (error) throw error;
}

export async function setSnippetCollections(
  client: TypedSupabaseClient,
  workspaceId: string,
  snippetId: string,
  collectionIds: string[],
): Promise<void> {
  const { error: deleteError } = await client
    .from("snippet_collections")
    .delete()
    .eq("snippet_id", snippetId);
  if (deleteError) throw deleteError;

  if (collectionIds.length === 0) return;

  const rows: TablesInsert<"snippet_collections">[] = collectionIds.map((collectionId) => ({
    snippet_id: snippetId,
    collection_id: collectionId,
    workspace_id: workspaceId,
  }));

  const { error: insertError } = await client.from("snippet_collections").insert(rows);
  if (insertError) throw insertError;
}

export async function listCollectionOptions(
  client: TypedSupabaseClient,
  workspaceId: string,
): Promise<SelectOption[]> {
  const { data, error } = await client
    .from("collections")
    .select("id,name")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, name: row.name }));
}

export async function listProjectOptions(
  client: TypedSupabaseClient,
  workspaceId: string,
): Promise<SelectOption[]> {
  const { data, error } = await client
    .from("projects")
    .select("id,name")
    .eq("workspace_id", workspaceId)
    .eq("is_archived", false)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, name: row.name }));
}
