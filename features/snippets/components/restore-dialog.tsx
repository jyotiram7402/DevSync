"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { useSnippetActions } from "@/features/snippets/hooks/use-snippet-actions";

export function RestoreDialog({
  snippetId,
  snippetTitle,
  open,
  onClose,
}: {
  snippetId: string;
  snippetTitle: string;
  open: boolean;
  onClose: () => void;
}) {
  const actions = useSnippetActions();
  const [isPending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const success = await actions.restore(snippetId);
      if (success) onClose();
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Restore snippet"
      description={`Restore "${snippetTitle}" to your active snippets?`}
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
