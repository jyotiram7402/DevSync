"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  archiveSnippetAction,
  bulkArchiveSnippetsAction,
  bulkDeleteSnippetsAction,
  duplicateSnippetAction,
  moveSnippetAction,
  permanentlyDeleteSnippetAction,
  restoreSnippetAction,
  softDeleteSnippetAction,
  toggleFavoriteAction,
  togglePinAction,
} from "@/features/snippets/actions";
import type { ActionResult } from "@/types/api";

/**
 * Client wrapper over snippet Server Actions: toast on error, optional success
 * toast, refresh on success, resolve to a boolean so callers can close dialogs.
 */
export interface SnippetActionsApi {
  archive: (id: string) => Promise<boolean>;
  restore: (id: string) => Promise<boolean>;
  duplicate: (id: string) => Promise<boolean>;
  softDelete: (id: string) => Promise<boolean>;
  permanentDelete: (id: string) => Promise<boolean>;
  setFavorite: (id: string, value: boolean) => Promise<boolean>;
  setPinned: (id: string, value: boolean) => Promise<boolean>;
  move: (id: string, projectId: string | null) => Promise<boolean>;
  bulkArchive: (ids: string[]) => Promise<boolean>;
  bulkDelete: (ids: string[]) => Promise<boolean>;
}

export function useSnippetActions(): SnippetActionsApi {
  const router = useRouter();

  async function run(
    action: Promise<ActionResult<unknown>>,
    successMessage?: string,
  ): Promise<boolean> {
    const result = await action;
    if (!result.ok) {
      toast.error(result.error.message);
      return false;
    }
    if (successMessage) toast.success(successMessage);
    router.refresh();
    return true;
  }

  return {
    archive: (id) => run(archiveSnippetAction(id), "Snippet archived"),
    restore: (id) => run(restoreSnippetAction(id), "Snippet restored"),
    duplicate: (id) => run(duplicateSnippetAction(id), "Snippet duplicated"),
    softDelete: (id) => run(softDeleteSnippetAction(id), "Snippet deleted"),
    permanentDelete: (id) => run(permanentlyDeleteSnippetAction(id), "Snippet permanently deleted"),
    setFavorite: (id, value) => run(toggleFavoriteAction(id, value)),
    setPinned: (id, value) => run(togglePinAction(id, value)),
    move: (id, projectId) => run(moveSnippetAction(id, projectId), "Snippet moved"),
    bulkArchive: (ids) => run(bulkArchiveSnippetsAction(ids), "Snippets archived"),
    bulkDelete: (ids) => run(bulkDeleteSnippetsAction(ids), "Snippets deleted"),
  };
}
