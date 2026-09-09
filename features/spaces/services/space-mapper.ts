import type { Space, SpaceItem } from "@/features/spaces/types";
import type { Tables } from "@/types/database";

export function mapSpaceRow(row: Tables<"spaces">): Space {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    createdBy: row.created_by,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export function mapItemRow(row: Tables<"space_items">, currentUserId: string): SpaceItem {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    spaceId: row.space_id,
    userId: row.user_id,
    kind: row.kind,
    content: row.content,
    path: typeof meta.path === "string" ? meta.path : null,
    mimeType: typeof meta.mimeType === "string" ? meta.mimeType : null,
    size: typeof meta.size === "number" ? meta.size : null,
    author: typeof meta.by === "string" ? meta.by : null,
    createdAt: row.created_at,
    mine: row.user_id === currentUserId,
  };
}

export function mapItemRows(rows: Tables<"space_items">[], currentUserId: string): SpaceItem[] {
  return rows.map((row) => mapItemRow(row, currentUserId));
}
