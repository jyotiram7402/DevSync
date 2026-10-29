"use client";

import { Archive, ArchiveRestore, Pencil, Pin, PinOff, Star, StarOff, Trash2 } from "lucide-react";
import { useState } from "react";

import { Menu, type MenuEntry } from "@/components/ui/menu";
import { DeleteDialog } from "@/features/projects/components/delete-dialog";
import { ProjectDialog } from "@/features/projects/components/project-dialog";
import { useProjectActions } from "@/features/projects/hooks/use-project-actions";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";

/**
 * A project's actions: edit (in a dialog), favorite, pin, archive or restore
 * (right away, with Undo), and delete (asks first). A dropdown on desktop and
 * an action sheet on phones; dialogs open above everything else.
 */
export function ProjectMenu({
  project,
  permissions,
  redirectAfterDelete,
}: {
  project: Project;
  permissions: ProjectPermissions;
  /** On the project's own page, deleting returns to the list. */
  redirectAfterDelete?: string | undefined;
}) {
  const actions = useProjectActions();
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);

  const items: MenuEntry[] = [];
  if (permissions.canEdit) {
    items.push({ label: "Edit", icon: Pencil, onSelect: () => setDialog("edit") });
  }
  if (permissions.canFavorite) {
    items.push({
      label: project.favorite ? "Remove from favorites" : "Add to favorites",
      icon: project.favorite ? StarOff : Star,
      onSelect: () => void actions.setFavorite(project.id, !project.favorite),
    });
  }
  if (permissions.canEdit) {
    items.push({
      label: project.pinned ? "Unpin" : "Pin to top",
      icon: project.pinned ? PinOff : Pin,
      onSelect: () => void actions.setPinned(project.id, !project.pinned),
    });
  }
  if ((permissions.canArchive || permissions.canDelete) && items.length > 0) items.push("separator");
  if (permissions.canArchive) {
    items.push(
      project.archived
        ? { label: "Restore", icon: ArchiveRestore, onSelect: () => void actions.restore(project.id) }
        : { label: "Archive", icon: Archive, onSelect: () => void actions.archive(project.id) },
    );
  }
  if (permissions.canDelete) {
    items.push({ label: "Delete", icon: Trash2, destructive: true, onSelect: () => setDialog("delete") });
  }

  if (items.length === 0) return null;

  return (
    <>
      <Menu label="Project actions" items={items} />
      {permissions.canEdit ? (
        <ProjectDialog open={dialog === "edit"} onClose={() => setDialog(null)} mode="edit" project={project} />
      ) : null}
      {permissions.canDelete ? (
        <DeleteDialog
          project={project}
          open={dialog === "delete"}
          onClose={() => setDialog(null)}
          canPermanentDelete={permissions.canPermanentDelete}
          redirectTo={redirectAfterDelete}
        />
      ) : null}
    </>
  );
}
