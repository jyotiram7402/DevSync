"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { useSnippetActions } from "@/features/snippets/hooks/use-snippet-actions";

/**
 * Delete confirmation. Soft delete by default (recoverable); owners/admins may
 * delete permanently. Navigates to the snippets list on success.
 */
export function DeleteDialog({
  snippetId,
  snippetTitle,
  open,
  onClose,
  canPermanentDelete,
}: {
  snippetId: string;
  snippetTitle: string;
  open: boolean;
  onClose: () => void;
  canPermanentDelete: boolean;
}) {
  const actions = useSnippetActions();
  const router = useRouter();
  const [permanent, setPermanent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const success =
        permanent && canPermanentDelete
          ? await actions.permanentDelete(snippetId)
          : await actions.softDelete(snippetId);
      if (success) {
        onClose();
        router.push("/dashboard/snippets");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete snippet"
      description={
        permanent
          ? `Permanently delete "${snippetTitle}"? This cannot be undone.`
          : `Delete "${snippetTitle}"? It will be moved to trash.`
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
