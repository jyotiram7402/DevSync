"use client";

import { Archive, ArchiveRestore, MoreHorizontal, Pencil, Pin, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ArchiveDialog } from "@/features/projects/components/archive-dialog";
import { DeleteDialog } from "@/features/projects/components/delete-dialog";
import { RestoreDialog } from "@/features/projects/components/restore-dialog";
import { useProjectActions } from "@/features/projects/hooks/use-project-actions";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";
import { cn } from "@/utils/cn";

type DialogKind = "archive" | "restore" | "delete" | null;

const ITEM_CLASS =
  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ProjectMenu({
  project,
  permissions,
}: {
  project: Project;
  permissions: ProjectPermissions;
}) {
  const actions = useProjectActions();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        aria-label="Project actions"
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
              href={`/dashboard/projects/${project.id}/edit`}
              onClick={() => setOpen(false)}
              className={ITEM_CLASS}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Link>
          ) : null}

          {permissions.canFavorite ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                void actions.setFavorite(project.id, !project.favorite);
                setOpen(false);
              }}
              className={ITEM_CLASS}
            >
              <Star className={cn("size-4", project.favorite && "fill-current text-amber-500")} aria-hidden="true" />
              {project.favorite ? "Remove favorite" : "Favorite"}
            </button>
          ) : null}

          {permissions.canEdit ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                void actions.setPinned(project.id, !project.pinned);
                setOpen(false);
              }}
              className={ITEM_CLASS}
            >
              <Pin className={cn("size-4", project.pinned && "fill-current")} aria-hidden="true" />
              {project.pinned ? "Unpin" : "Pin"}
            </button>
          ) : null}

          {permissions.canArchive || permissions.canDelete ? (
            <div className="my-1 h-px bg-border" role="separator" />
          ) : null}

          {permissions.canArchive ? (
            project.archived ? (
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

      <ArchiveDialog project={project} open={dialog === "archive"} onClose={() => setDialog(null)} />
      <RestoreDialog project={project} open={dialog === "restore"} onClose={() => setDialog(null)} />
      <DeleteDialog
        project={project}
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        canPermanentDelete={permissions.canPermanentDelete}
      />
    </div>
  );
}
