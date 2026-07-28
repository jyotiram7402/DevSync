"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { useProjectActions } from "@/features/projects/hooks/use-project-actions";
import type { Project } from "@/features/projects/types";

/**
 * Delete confirmation. Defaults to a soft delete (recoverable). Owners may opt
 * into permanent deletion. On success, navigates to the projects list.
 */
export function DeleteDialog({
  project,
  open,
  onClose,
  canPermanentDelete,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
  canPermanentDelete: boolean;
}) {
  const actions = useProjectActions();
  const router = useRouter();
  const [permanent, setPermanent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const success =
        permanent && canPermanentDelete
          ? await actions.permanentDelete(project.id)
          : await actions.softDelete(project.id);
      if (success) {
        onClose();
        router.push("/dashboard/projects");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete project"
      description={
        permanent
          ? `Permanently delete "${project.name}"? This cannot be undone.`
          : `Delete "${project.name}"? It will be moved to trash and can be recovered.`
      }
    >
      {canPermanentDelete ? (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={permanent}
            onChange={(event) => setPermanent(event.target.checked)}
            className="size-4 rounded border-input accent-destructive"
          />
          Delete permanently (cannot be undone)
        </label>
      ) : null}

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={confirm} disabled={isPending} aria-busy={isPending}>
          {isPending ? "Deleting…" : permanent ? "Delete permanently" : "Delete"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
