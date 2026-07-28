import { getSupabaseClient } from "@ext/shared/supabase-client";
import { RECENT_SNIPPETS_LIMIT } from "@ext/shared/constants";
import type { RecentSnippet } from "@ext/types";
import { firstLine, truncate } from "@ext/utils/format";
import type { TablesInsert } from "@/types/database";

const RECENT_SELECT = "id,title,content,language,pinned,favorite,updated_at" as const;

export async function listRecentSnippets(workspaceId: string): Promise<RecentSnippet[]> {
  const { data, error } = await getSupabaseClient()
    .from("snippets")
    .select(RECENT_SELECT)
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .eq("archived", false)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(RECENT_SNIPPETS_LIMIT);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title && row.title.length > 0 ? row.title : firstLine(row.content) || "Untitled snippet",
    language: row.language,
    preview: truncate(row.content, 140),
    pinned: row.pinned,
    favorite: row.favorite,
    updatedAt: row.updated_at,
  }));
}

export async function getSnippetContent(id: string): Promise<string | null> {
  const { data, error } = await getSupabaseClient()
    .from("snippets")
    .select("content")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) return null;
  return data.content;
}

export interface CreateSnippetInput {
  workspaceId: string;
  content: string;
  title?: string;
  language?: string;
}

export async function createSnippet(input: CreateSnippetInput): Promise<string> {
  const client = getSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const language = input.language && input.language.length > 0 ? input.language : null;
  const values: TablesInsert<"snippets"> = {
    workspace_id: input.workspaceId,
    content: input.content,
    title: input.title && input.title.length > 0 ? input.title : null,
    language,
    type: language && language !== "plaintext" ? "code" : "text",
    tags: [],
    visibility: "private",
    created_by: user.id,
    updated_by: user.id,
  };

  const { data, error } = await client.from("snippets").insert(values).select("id").single();
  if (error || !data) throw new Error(error?.message ?? "Failed to save snippet.");
  return data.id;
}
