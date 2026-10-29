"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter, ResponsiveDialog } from "@/components/ui/dialog";
import { useProjectActions } from "@/features/projects/hooks/use-project-actions";
import type { Project } from "@/features/projects/types";

/**
 * Delete confirmation. There is no Trash, so it says plainly that this can't
 * be undone. By default the project is hidden (kept in the database, never
 * shown again); owners can choose to erase it completely. Either way its
 * snippets stay in Snippets. Focus starts on Cancel.
 */
export function DeleteDialog({
  project,
  open,
  onClose,
  canPermanentDelete,
  redirectTo,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
  canPermanentDelete: boolean;
  /** Where to go afterwards (from the project's own page: the list). */
  redirectTo?: string | undefined;
}) {
  const actions = useProjectActions();
  const router = useRouter();
  const eraseId = useId();
  const [erase, setErase] = useState(false);
  const [pending, setPending] = useState(false);

  function close() {
    if (pending) return;
    setErase(false);
    onClose();
  }

  async function confirm() {
    setPending(true);
    const success =
      erase && canPermanentDelete
        ? await actions.permanentDelete(project.id)
        : await actions.softDelete(project.id);
    setPending(false);
    if (!success) return;
    setErase(false);
    onClose();
    if (redirectTo) router.push(redirectTo);
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={close}
      title="Delete this project?"
      description={`"${project.name}" is removed from your projects. Its snippets stay in Snippets. You can't undo this.`}
      size="sm"
      footer={
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close} disabled={pending} data-autofocus="">
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={() => void confirm()} loading={pending}>
            {erase ? "Erase project" : "Delete project"}
          </Button>
        </DialogFooter>
      }
    >
      {canPermanentDelete ? (
        <div className="flex items-start gap-3">
          <Checkbox
            id={eraseId}
            checked={erase}
            onChange={(event) => setErase(event.target.checked)}
            aria-describedby={`${eraseId}-hint`}
            className="mt-0.5"
          />
          <div className="flex flex-col gap-0.5">
            <label htmlFor={eraseId} className="text-sm font-medium">
              Erase it completely
            </label>
            <p id={`${eraseId}-hint`} className="text-sm text-muted-foreground">
              Without this, the project is hidden but its name and description stay stored.
            </p>
          </div>
        </div>
      ) : null}
    </ResponsiveDialog>
  );
}
