import type { WorkspaceRole } from "@/features/snippets/types";

/**
 * Snippets feature — permission model derived from workspace role. UX/guard
 * conveniences; RLS is authoritative. Editors are owner/admin/member;
 * permanent deletion is restricted to owners and admins.
 */
const EDITOR_ROLES: readonly WorkspaceRole[] = ["owner", "admin", "member"];

function isEditor(role: WorkspaceRole): boolean {
  return EDITOR_ROLES.includes(role);
}

export interface SnippetPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPermanentDelete: boolean;
  canFavorite: boolean;
  canArchive: boolean;
  canDuplicate: boolean;
  canBulk: boolean;
}

export function getSnippetPermissions(role: WorkspaceRole): SnippetPermissions {
  const editor = isEditor(role);
  return {
    canCreate: editor,
    canEdit: editor,
    canDelete: editor,
    canPermanentDelete: role === "owner" || role === "admin",
    canFavorite: editor,
    canArchive: editor,
    canDuplicate: editor,
    canBulk: editor,
  };
}
