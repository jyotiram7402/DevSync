import type { WorkspaceRole } from "@/features/projects/types";

/**
 * Projects feature — permission model derived from workspace role.
 *
 * These are UX/guard conveniences; the database RLS policies are the
 * authoritative boundary. Editors are owner/admin/member; viewers are
 * read-only; permanent deletion is restricted to owners.
 */
const EDITOR_ROLES: readonly WorkspaceRole[] = ["owner", "admin", "member"];

function isEditor(role: WorkspaceRole): boolean {
  return EDITOR_ROLES.includes(role);
}

export interface ProjectPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canArchive: boolean;
  canDelete: boolean;
  canPermanentDelete: boolean;
  canFavorite: boolean;
}

export function getProjectPermissions(role: WorkspaceRole): ProjectPermissions {
  const editor = isEditor(role);
  return {
    canCreate: editor,
    canEdit: editor,
    canArchive: editor,
    canDelete: editor,
    canPermanentDelete: role === "owner",
    canFavorite: editor,
  };
}
