import type { Snippet, SnippetVisibility } from "@/features/snippets/types";
import type { Tables } from "@/types/database";

/**
 * SnippetMapper — transforms raw `snippets` rows into the domain model
 * (snake_case → camelCase). Collection ids are supplied separately (joined
 * from snippet_collections) since they are not columns on the row.
 */
function toVisibility(value: string): SnippetVisibility {
  return value === "workspace" || value === "public" ? value : "private";
}

function toMetadata(value: Tables<"snippets">["metadata"]): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function mapSnippetRow(
  row: Tables<"snippets">,
  collectionIds: string[] = [],
): Snippet {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    title: row.title,
    content: row.content,
    language: row.language,
    type: row.type,
    tags: row.tags,
    collectionIds,
    favorite: row.favorite,
    pinned: row.pinned,
    archived: row.archived,
    visibility: toVisibility(row.visibility),
    sourceDeviceId: row.source_device_id,
    metadata: toMetadata(row.metadata),
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSnippetRows(rows: readonly Tables<"snippets">[]): Snippet[] {
  return rows.map((row) => mapSnippetRow(row));
}
