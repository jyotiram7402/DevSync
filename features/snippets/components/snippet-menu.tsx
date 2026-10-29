"use client";

import { Archive, ArchiveRestore, Copy, Pencil, Pin, PinOff, Star, StarOff, Trash2 } from "lucide-react";
import { useState } from "react";

import { Menu, type MenuEntry } from "@/components/ui/menu";
import { ArchiveDialog } from "@/features/snippets/components/archive-dialog";
import { DeleteDialog } from "@/features/snippets/components/delete-dialog";
import { RestoreDialog } from "@/features/snippets/components/restore-dialog";
import { useSnippetActions } from "@/features/snippets/hooks/use-snippet-actions";
import type { SnippetPermissions } from "@/features/snippets/permissions";
import type { Snippet } from "@/features/snippets/types";

type DialogKind = "archive" | "restore" | "delete" | null;

/**
 * A snippet's overflow actions: edit, duplicate, favorite, pin, archive or
 * restore, delete. A dropdown on desktop and an action sheet on phones (Menu);
 * archive, restore and delete ask first.
 */
export function SnippetMenu({
  snippet,
  permissions,
}: {
  snippet: Snippet;
  permissions: SnippetPermissions;
}) {
  const actions = useSnippetActions();
  const [dialog, setDialog] = useState<DialogKind>(null);
  const title = snippet.title ?? "this snippet";

  const items: MenuEntry[] = [];
  if (permissions.canEdit) {
    items.push({ label: "Edit", icon: Pencil, href: `/dashboard/snippets/${snippet.id}/edit` });
  }
  if (permissions.canDuplicate) {
    items.push({ label: "Duplicate", icon: Copy, onSelect: () => void actions.duplicate(snippet.id) });
  }
  if (permissions.canFavorite) {
    items.push({
      label: snippet.favorite ? "Remove favorite" : "Favorite",
      icon: snippet.favorite ? StarOff : Star,
      onSelect: () => void actions.setFavorite(snippet.id, !snippet.favorite),
    });
  }
  if (permissions.canEdit) {
    items.push({
      label: snippet.pinned ? "Unpin" : "Pin",
      icon: snippet.pinned ? PinOff : Pin,
      onSelect: () => void actions.setPinned(snippet.id, !snippet.pinned),
    });
  }
  if (permissions.canArchive || permissions.canDelete) items.push("separator");
  if (permissions.canArchive) {
    items.push(
      snippet.archived
        ? { label: "Restore", icon: ArchiveRestore, onSelect: () => setDialog("restore") }
        : { label: "Archive", icon: Archive, onSelect: () => setDialog("archive") },
    );
  }
  if (permissions.canDelete) {
    items.push({ label: "Delete", icon: Trash2, destructive: true, onSelect: () => setDialog("delete") });
  }

  return (
    <>
      <Menu label="Snippet actions" items={items} />
      <ArchiveDialog
        snippetId={snippet.id}
        snippetTitle={title}
        open={dialog === "archive"}
        onClose={() => setDialog(null)}
      />
      <RestoreDialog
        snippetId={snippet.id}
        snippetTitle={title}
        open={dialog === "restore"}
        onClose={() => setDialog(null)}
      />
      <DeleteDialog
        snippetId={snippet.id}
        snippetTitle={title}
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        canPermanentDelete={permissions.canPermanentDelete}
      />
    </>
  );
}
