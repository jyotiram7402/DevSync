"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { useSnippetActions } from "@/features/snippets/hooks/use-snippet-actions";

export function ArchiveDialog({
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
      const success = await actions.archive(snippetId);
      if (success) onClose();
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Archive snippet"
      description={`Archive "${snippetTitle}"? You can restore it from the Archived filter later.`}
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
