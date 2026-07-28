import "server-only";

import { getProjectPermissions } from "@/features/projects/permissions";
import * as repository from "@/features/projects/services/project-repository";
import { PROJECT_PAGE_SIZE, DEFAULT_PROJECT_SORT, DEFAULT_PROJECT_STATUS } from "@/features/projects/constants";
import { projectFormSchema, toFieldErrors, type ProjectFormValues } from "@/features/projects/schemas";
import type {
  Project,
  ProjectListParams,
  ProjectListResult,
  WorkspaceRole,
} from "@/features/projects/types";
import { mapProjectRow } from "@/features/projects/utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionError, ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";

/**
 * ProjectService — server-side orchestration: resolves the active workspace and
 * role, enforces permissions, validates input (Zod), delegates to the
 * repository, maps rows to the domain, and returns the typed ActionResult
 * contract (never throwing across the boundary).
 */
const NO_WORKSPACE: ActionError = {
  code: "NOT_FOUND",
  message: "No workspace found for your account.",
};

function toActionError(error: unknown): ActionError {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";

  if (code === "PGRST116") {
    return { code: "NOT_FOUND", message: "Project not found." };
  }
  if (/row-level security|violates row-level|permission denied/i.test(message)) {
    return { code: "FORBIDDEN", message: "You do not have permission to do that." };
  }
  // eslint-disable-next-line no-console
  console.error("[projects] service error:", code, message);
  return { code: "INTERNAL", message: "Something went wrong. Please try again." };
}

function normalizeOptional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function listProjects(
  params: ProjectListParams,
): Promise<ActionResult<ProjectListResult>> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);

    const status = params.status ?? DEFAULT_PROJECT_STATUS;
    const sort = params.sort ?? DEFAULT_PROJECT_SORT;
    const pageSize = params.pageSize ?? PROJECT_PAGE_SIZE;
    const page = Math.max(1, params.page ?? 1);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { rows, count } = await repository.listProjectRows(client, {
      workspaceId: context.workspaceId,
      status,
      sort,
      search: params.search,
      from,
      to,
    });

    return ok({
      projects: rows.map(mapProjectRow),
      total: count,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
      role: context.role,
    });
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function getProject(
  id: string,
): Promise<ActionResult<{ project: Project; role: WorkspaceRole }>> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);

    const row = await repository.findProjectRow(client, context.workspaceId, id);
    if (!row) return err({ code: "NOT_FOUND", message: "Project not found." });

    return ok({ project: mapProjectRow(row), role: context.role });
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function createProject(values: ProjectFormValues): Promise<ActionResult<Project>> {
  const parsed = projectFormSchema.safeParse(values);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_FAILED",
      message: "Please check the form and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    });
  }

  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);
    if (!getProjectPermissions(context.role).canCreate) {
      return err({ code: "FORBIDDEN", message: "You cannot create projects in this workspace." });
    }

    const row = await repository.insertProjectRow(client, {
      workspace_id: context.workspaceId,
      name: parsed.data.name,
      description: normalizeOptional(parsed.data.description),
      icon: normalizeOptional(parsed.data.icon),
      color: normalizeOptional(parsed.data.color),
      is_default: false,
      created_by: context.userId,
      updated_by: context.userId,
    });

    return ok(mapProjectRow(row));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function updateProject(
  id: string,
  values: ProjectFormValues,
): Promise<ActionResult<Project>> {
  const parsed = projectFormSchema.safeParse(values);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_FAILED",
      message: "Please check the form and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    });
  }

  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);
    if (!getProjectPermissions(context.role).canEdit) {
      return err({ code: "FORBIDDEN", message: "You cannot edit this project." });
    }

    const row = await repository.updateProjectRow(client, context.workspaceId, id, {
      name: parsed.data.name,
      description: normalizeOptional(parsed.data.description),
      icon: normalizeOptional(parsed.data.icon),
      color: normalizeOptional(parsed.data.color),
      updated_by: context.userId,
    });

    return ok(mapProjectRow(row));
  } catch (error) {
    return err(toActionError(error));
  }
}

async function patchProject(
  id: string,
  patch: { is_archived?: boolean; is_favorite?: boolean; is_pinned?: boolean; deleted_at?: string },
  requires: "canArchive" | "canEdit" | "canFavorite" | "canDelete",
): Promise<ActionResult<Project>> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);
    if (!getProjectPermissions(context.role)[requires]) {
      return err({ code: "FORBIDDEN", message: "You do not have permission to do that." });
    }

    const row = await repository.updateProjectRow(client, context.workspaceId, id, {
      ...patch,
      updated_by: context.userId,
    });

    return ok(mapProjectRow(row));
  } catch (error) {
    return err(toActionError(error));
  }
}

export function setArchived(id: string, archived: boolean): Promise<ActionResult<Project>> {
  return patchProject(id, { is_archived: archived }, "canArchive");
}

export function setFavorite(id: string, favorite: boolean): Promise<ActionResult<Project>> {
  return patchProject(id, { is_favorite: favorite }, "canFavorite");
}

export function setPinned(id: string, pinned: boolean): Promise<ActionResult<Project>> {
  return patchProject(id, { is_pinned: pinned }, "canEdit");
}

export async function softDeleteProject(id: string): Promise<ActionResult> {
  const result = await patchProject(id, { deleted_at: new Date().toISOString() }, "canDelete");
  return result.ok ? ok(undefined) : result;
}

export async function permanentlyDeleteProject(id: string): Promise<ActionResult> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);
    if (!getProjectPermissions(context.role).canPermanentDelete) {
      return err({ code: "FORBIDDEN", message: "Only the workspace owner can permanently delete." });
    }

    await repository.deleteProjectRow(client, context.workspaceId, id);
    return ok(undefined);
  } catch (error) {
    return err(toActionError(error));
  }
}
