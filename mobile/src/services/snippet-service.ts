import {
  findSnippetRow,
  listSnippetRows,
  resolveContext,
} from "@/features/snippets/services/snippet-repository";
import type { Tables } from "@/types/database";
import { RECENT_LIMIT, SECTION_LIMIT } from "~/lib/constants";
import { supabase } from "~/lib/supabase";
import type { ContentKind, RecentItem } from "~/types";
import { firstLine, truncate } from "~/utils/format";
import { looksLikeUrl } from "~/utils/mime";

/**
 * Snippet reads — reuse the shared, framework-agnostic snippet-repository
 * (same queries the web app uses) with the mobile Supabase client. RLS scopes
 * every result; no query logic is duplicated.
 */
const LIST_SELECT = "id,title,content,language,pinned,favorite,updated_at,metadata" as const;

function readKind(metadata: Tables<"snippets">["metadata"], content: string): ContentKind {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const kind = (metadata as Record<string, unknown>).kind;
    if (typeof kind === "string") return kind as ContentKind;
  }
  return looksLikeUrl(content) ? "url" : "text";
}

function toRecent(row: Tables<"snippets">): RecentItem {
  return {
    id: row.id,
    title: row.title && row.title.length > 0 ? row.title : firstLine(row.content) || "Untitled",
    preview: truncate(row.content, 140),
    language: row.language,
    kind: readKind(row.metadata, row.content),
    pinned: row.pinned,
    favorite: row.favorite,
    updatedAt: row.updated_at,
  };
}

export async function resolveMobileContext() {
  return resolveContext(supabase);
}

export async function listRecent(workspaceId: string): Promise<RecentItem[]> {
  const { rows } = await listSnippetRows(supabase, {
    workspaceId,
    status: "active",
    sort: "updated",
    search: undefined,
    projectId: undefined,
    language: undefined,
    from: 0,
    to: RECENT_LIMIT - 1,
  });
  return rows.map(toRecent);
}

async function listFlag(workspaceId: string, column: "favorite" | "pinned"): Promise<RecentItem[]> {
  const { data, error } = await supabase
    .from("snippets")
    .select(LIST_SELECT)
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .eq("archived", false)
    .eq(column, true)
    .order("updated_at", { ascending: false })
    .limit(SECTION_LIMIT);
  if (error || !data) return [];
  return data.map((row) => toRecent(row as Tables<"snippets">));
}

export function listFavorites(workspaceId: string): Promise<RecentItem[]> {
  return listFlag(workspaceId, "favorite");
}

export function listPinned(workspaceId: string): Promise<RecentItem[]> {
  return listFlag(workspaceId, "pinned");
}

export async function getSnippet(workspaceId: string, id: string): Promise<Tables<"snippets"> | null> {
  return findSnippetRow(supabase, workspaceId, id);
}
