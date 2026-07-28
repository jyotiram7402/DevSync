"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { useProjectActions } from "@/features/projects/hooks/use-project-actions";
import type { Project } from "@/features/projects/types";

export function RestoreDialog({
  project,
  open,
  onClose,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
}) {
  const actions = useProjectActions();
  const [isPending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const success = await actions.restore(project.id);
      if (success) onClose();
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Restore project"
      description={`Restore "${project.name}" to your active projects?`}
    >
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={confirm} disabled={isPending} aria-busy={isPending}>
          {isPending ? "Restoring…" : "Restore"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
