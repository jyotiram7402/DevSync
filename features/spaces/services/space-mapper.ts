import {
  SPACE_CATEGORIES,
  type Space,
  type SpaceCategory,
  type SpaceItem,
  type SpaceMember,
} from "@/features/spaces/types";
import type { Database, Tables } from "@/types/database";

type MemberRow = Database["public"]["Functions"]["list_space_members"]["Returns"][number];

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

function toCategory(value: string): SpaceCategory {
  return (SPACE_CATEGORIES as readonly string[]).includes(value) ? (value as SpaceCategory) : "code";
}

export function mapItemRow(row: Tables<"space_items">, currentUserId: string): SpaceItem {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    spaceId: row.space_id,
    userId: row.user_id,
    kind: row.kind,
    category: toCategory(row.category),
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

export function mapMemberRows(rows: MemberRow[], currentUserId: string): SpaceMember[] {
  return rows.map((row) => ({
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    joinedAt: row.joined_at,
    isOwner: row.is_owner,
    isYou: row.user_id === currentUserId,
  }));
}
