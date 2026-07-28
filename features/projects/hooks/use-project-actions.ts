"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  archiveProjectAction,
  permanentlyDeleteProjectAction,
  restoreProjectAction,
  softDeleteProjectAction,
  toggleFavoriteAction,
  togglePinAction,
} from "@/features/projects/actions";
import type { ActionResult } from "@/types/api";

/**
 * Client wrapper over the project Server Actions. Each handler surfaces errors
 * via toast, shows an optional success toast, refreshes server components on
 * success, and resolves to a boolean so callers (dialogs) can close on success.
 * Callers manage their own pending state (useTransition) for button disabling.
 */
export interface ProjectActionsApi {
  archive: (id: string) => Promise<boolean>;
  restore: (id: string) => Promise<boolean>;
  softDelete: (id: string) => Promise<boolean>;
  permanentDelete: (id: string) => Promise<boolean>;
  setFavorite: (id: string, value: boolean) => Promise<boolean>;
  setPinned: (id: string, value: boolean) => Promise<boolean>;
}

export function useProjectActions(): ProjectActionsApi {
  const router = useRouter();

  async function run(action: Promise<ActionResult<unknown>>, successMessage?: string): Promise<boolean> {
    const result = await action;
    if (!result.ok) {
      toast.error(result.error.message);
      return false;
    }
    if (successMessage) {
      toast.success(successMessage);
    }
    router.refresh();
    return true;
  }

  return {
    archive: (id) => run(archiveProjectAction(id), "Project archived"),
    restore: (id) => run(restoreProjectAction(id), "Project restored"),
    softDelete: (id) => run(softDeleteProjectAction(id), "Project deleted"),
    permanentDelete: (id) => run(permanentlyDeleteProjectAction(id), "Project permanently deleted"),
    setFavorite: (id, value) => run(toggleFavoriteAction(id, value)),
    setPinned: (id, value) => run(togglePinAction(id, value)),
  };
}
