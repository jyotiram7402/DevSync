"use client";

import { Archive, Trash2, X } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useSnippetActions } from "@/features/snippets/hooks/use-snippet-actions";
import { useSnippetSelection } from "@/features/snippets/hooks/use-snippet-selection";
import type { SnippetPermissions } from "@/features/snippets/permissions";

/** Floating bar shown when snippets are selected, offering bulk actions. */
export function BulkActionBar({ permissions }: { permissions: SnippetPermissions }) {
  const selectedIds = useSnippetSelection((state) => state.selectedIds);
  const clear = useSnippetSelection((state) => state.clear);
  const actions = useSnippetActions();
  const [isPending, startTransition] = useTransition();

  if (selectedIds.length === 0) return null;

  function runArchive() {
    startTransition(async () => {
      const ok = await actions.bulkArchive(selectedIds);
      if (ok) clear();
    });
  }

  function runDelete() {
    startTransition(async () => {
      const ok = await actions.bulkDelete(selectedIds);
      if (ok) clear();
    });
  }

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="sticky bottom-4 z-30 mx-auto flex w-fit items-center gap-1 rounded-full border bg-popover px-3 py-2 text-popover-foreground shadow-premium"
    >
      <span className="px-1 text-sm font-medium">{selectedIds.length} selected</span>
      {permissions.canArchive ? (
        <Button type="button" variant="ghost" size="sm" onClick={runArchive} disabled={isPending}>
          <Archive className="size-4" />
          Archive
        </Button>
      ) : null}
      {permissions.canDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={runDelete}
          disabled={isPending}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Clear selection"
        onClick={clear}
        disabled={isPending}
        className="size-8"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
