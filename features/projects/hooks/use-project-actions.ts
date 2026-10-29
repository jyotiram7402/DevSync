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
 * Client wrapper over the project Server Actions. Each handler shows errors in
 * a toast, refreshes server components on success, and resolves to a boolean
 * so callers (dialogs) can close on success. Archiving is reversible, so it
 * happens right away with Undo in the toast instead of asking first.
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

  async function run(
    action: Promise<ActionResult<unknown>>,
    success?: { message: string; undo?: () => Promise<ActionResult<unknown>> },
  ): Promise<boolean> {
    const result = await action;
    if (!result.ok) {
      toast.error(result.error.message);
      return false;
    }
    if (success) {
      const undo = success.undo;
      toast.success(
        success.message,
        undo ? { action: { label: "Undo", onClick: () => void run(undo()) } } : undefined,
      );
    }
    router.refresh();
    return true;
  }

  return {
    archive: (id) =>
      run(archiveProjectAction(id), { message: "Project archived.", undo: () => restoreProjectAction(id) }),
    restore: (id) => run(restoreProjectAction(id), { message: "Project restored." }),
    softDelete: (id) => run(softDeleteProjectAction(id), { message: "Project deleted." }),
    permanentDelete: (id) => run(permanentlyDeleteProjectAction(id), { message: "Project deleted." }),
    setFavorite: (id, value) => run(toggleFavoriteAction(id, value)),
    setPinned: (id, value) => run(togglePinAction(id, value)),
  };
}
