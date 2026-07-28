"use client";

import { Archive, ArchiveRestore, Copy, MoreHorizontal, Pencil, Pin, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ArchiveDialog } from "@/features/snippets/components/archive-dialog";
import { DeleteDialog } from "@/features/snippets/components/delete-dialog";
import { RestoreDialog } from "@/features/snippets/components/restore-dialog";
import { useSnippetActions } from "@/features/snippets/hooks/use-snippet-actions";
import type { SnippetPermissions } from "@/features/snippets/permissions";
import type { Snippet } from "@/features/snippets/types";
import { cn } from "@/utils/cn";

type DialogKind = "archive" | "restore" | "delete" | null;

const ITEM_CLASS =
  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SnippetMenu({
  snippet,
  permissions,
}: {
  snippet: Snippet;
  permissions: SnippetPermissions;
}) {
  const actions = useSnippetActions();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const title = snippet.title ?? "Untitled";

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative z-10">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Snippet actions"
        onClick={() => setOpen((value) => !value)}
        className="size-8"
      >
        <MoreHorizontal className="size-4" />
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {permissions.canEdit ? (
            <Link
              role="menuitem"
              href={`/dashboard/snippets/${snippet.id}/edit`}
              onClick={() => setOpen(false)}
              className={ITEM_CLASS}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Link>
          ) : null}

          {permissions.canDuplicate ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                void actions.duplicate(snippet.id);
                setOpen(false);
              }}
              className={ITEM_CLASS}
            >
              <Copy className="size-4" aria-hidden="true" />
              Duplicate
            </button>
          ) : null}

          {permissions.canFavorite ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                void actions.setFavorite(snippet.id, !snippet.favorite);
                setOpen(false);
              }}
              className={ITEM_CLASS}
            >
              <Star className={cn("size-4", snippet.favorite && "fill-current text-amber-500")} aria-hidden="true" />
              {snippet.favorite ? "Remove favorite" : "Favorite"}
            </button>
          ) : null}

          {permissions.canEdit ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                void actions.setPinned(snippet.id, !snippet.pinned);
                setOpen(false);
              }}
              className={ITEM_CLASS}
            >
              <Pin className={cn("size-4", snippet.pinned && "fill-current")} aria-hidden="true" />
              {snippet.pinned ? "Unpin" : "Pin"}
            </button>
          ) : null}

          {permissions.canArchive || permissions.canDelete ? (
            <div className="my-1 h-px bg-border" role="separator" />
          ) : null}

          {permissions.canArchive ? (
            snippet.archived ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setDialog("restore");
                }}
                className={ITEM_CLASS}
              >
                <ArchiveRestore className="size-4" aria-hidden="true" />
                Restore
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setDialog("archive");
                }}
                className={ITEM_CLASS}
              >
                <Archive className="size-4" aria-hidden="true" />
                Archive
              </button>
            )
          ) : null}

          {permissions.canDelete ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setDialog("delete");
              }}
              className={cn(ITEM_CLASS, "text-destructive hover:bg-destructive/10")}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </button>
          ) : null}
        </div>
      ) : null}

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
    </div>
  );
}
