import type { Project } from "@/features/projects/types";
import type { Tables } from "@/types/database";

/**
 * Data mapping / transformation layer: convert a raw `projects` DB row into the
 * app-facing domain `Project` (snake_case → camelCase). Keeping this in one
 * place means the rest of the feature never touches raw rows.
 */
export function mapProjectRow(row: Tables<"projects">): Project {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    color: row.color,
    isDefault: row.is_default,
    favorite: row.is_favorite,
    pinned: row.is_pinned,
    archived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

export function mapProjectRows(rows: readonly Tables<"projects">[]): Project[] {
  return rows.map(mapProjectRow);
}
