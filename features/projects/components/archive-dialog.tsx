"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { useProjectActions } from "@/features/projects/hooks/use-project-actions";
import type { Project } from "@/features/projects/types";

export function ArchiveDialog({
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
      const success = await actions.archive(project.id);
      if (success) onClose();
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Archive project"
      description={`Archive "${project.name}"? You can restore it from the Archived filter later.`}
    >
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={confirm} disabled={isPending} aria-busy={isPending}>
          {isPending ? "Archiving…" : "Archive"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
