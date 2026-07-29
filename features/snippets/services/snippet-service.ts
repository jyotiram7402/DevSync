import "server-only";

import {
  DEFAULT_SNIPPET_SORT,
  DEFAULT_SNIPPET_STATUS,
  DEFAULT_SNIPPET_VISIBILITY,
  SNIPPET_PAGE_SIZE,
} from "@/features/snippets/constants";
import { getSnippetPermissions } from "@/features/snippets/permissions";
import * as repository from "@/features/snippets/services/snippet-repository";
import { mapSnippetRow, mapSnippetRows } from "@/features/snippets/services/snippet-mapper";
import { snippetFormSchema, toFieldErrors, type SnippetFormValues } from "@/features/snippets/schemas";
import type {
  SelectOption,
  Snippet,
  SnippetListParams,
  SnippetListResult,
  WorkspaceRole,
} from "@/features/snippets/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionError, ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";
import type { TablesInsert, TablesUpdate } from "@/types/database";

/**
 * SnippetService — server-side orchestration: resolves workspace/role, enforces
 * permissions, validates (Zod), delegates to the repository + mapper, and
 * returns the typed ActionResult contract.
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

  if (code === "PGRST116") return { code: "NOT_FOUND", message: "Snippet not found." };
  if (/row-level security|violates row-level|permission denied/i.test(message)) {
    return { code: "FORBIDDEN", message: "You do not have permission to do that." };
  }
  if (/value too long|check constraint/i.test(message)) {
    return { code: "VALIDATION_FAILED", message: "That content is not allowed." };
  }
  // eslint-disable-next-line no-console
  console.error("[snippets] service error:", code, message);
  return { code: "INTERNAL", message: "Something went wrong. Please try again." };
}

function deriveType(language: string | undefined): string {
  return language && language !== "plaintext" ? "code" : "text";
}

function normalize(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function getSnippetFormOptions(): Promise<
  ActionResult<{ projects: SelectOption[]; collections: SelectOption[] }>
> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);

    const [projects, collections] = await Promise.all([
      repository.listProjectOptions(client, context.workspaceId),
      repository.listCollectionOptions(client, context.workspaceId),
    ]);
    return ok({ projects, collections });
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function listSnippets(
  params: SnippetListParams,
): Promise<ActionResult<SnippetListResult>> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);

    const status = params.status ?? DEFAULT_SNIPPET_STATUS;
    const sort = params.sort ?? DEFAULT_SNIPPET_SORT;
    const pageSize = params.pageSize ?? SNIPPET_PAGE_SIZE;
    const page = Math.max(1, params.page ?? 1);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { rows, count } = await repository.listSnippetRows(client, {
      workspaceId: context.workspaceId,
      status,
      sort,
      search: params.search,
      projectId: params.projectId,
      language: params.language,
      from,
      to,
    });

    return ok({
      snippets: mapSnippetRows(rows),
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

export async function getSnippet(
  id: string,
): Promise<ActionResult<{ snippet: Snippet; role: WorkspaceRole }>> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);

    const row = await repository.findSnippetRow(client, context.workspaceId, id);
    if (!row) return err({ code: "NOT_FOUND", message: "Snippet not found." });

    const collectionIds = await repository.getSnippetCollectionIds(client, id);
    return ok({ snippet: mapSnippetRow(row, collectionIds), role: context.role });
  } catch (error) {
    return err(toActionError(error));
  }
}

/**
 * Quick Capture — file/image flow. Create a placeholder snippet row (type
 * "file", metadata status "uploading"), returning the ids the client needs to
 * upload the binary directly to the snippet-attachments bucket. The attachment
 * is linked back via `finalizeFileSnippet`. Reuses the same repository + RLS.
 */
export async function createPendingFileSnippet(input: {
  name: string;
  mimeType: string;
  size: number;
  kind: string;
}): Promise<ActionResult<{ snippetId: string; workspaceId: string }>> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);
    if (!getSnippetPermissions(context.role).canCreate) {
      return err({ code: "FORBIDDEN", message: "You cannot create snippets here." });
    }

    const name = input.name.trim().slice(0, 200) || "Untitled file";
    const insert: TablesInsert<"snippets"> = {
      workspace_id: context.workspaceId,
      content: name,
      title: name,
      // `type` is constrained by the DB (text/code/log/…); the file's real
      // nature is carried in metadata.kind. Use an allowed value here.
      type: "text",
      tags: [],
      visibility: DEFAULT_SNIPPET_VISIBILITY,
      created_by: context.userId,
      updated_by: context.userId,
      metadata: {
        kind: input.kind,
        mimeType: input.mimeType,
        size: input.size,
        status: "uploading",
        source: "web",
      },
    };
    const row = await repository.insertSnippetRow(client, insert);
    return ok({ snippetId: row.id, workspaceId: context.workspaceId });
  } catch (error) {
    return err(toActionError(error));
  }
}

/** Link an uploaded attachment to its pending snippet and mark it synced. */
export async function finalizeFileSnippet(
  id: string,
  meta: { bucket: string; path: string; mimeType: string; size: number; kind: string },
): Promise<ActionResult<void>> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);

    await repository.updateSnippetRow(client, context.workspaceId, id, {
      updated_by: context.userId,
      metadata: {
        kind: meta.kind,
        mimeType: meta.mimeType,
        size: meta.size,
        bucket: meta.bucket,
        path: meta.path,
        status: "synced",
        source: "web",
      },
    });
    return ok(undefined);
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function createSnippet(values: SnippetFormValues): Promise<ActionResult<Snippet>> {
  const parsed = snippetFormSchema.safeParse(values);
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
    if (!getSnippetPermissions(context.role).canCreate) {
      return err({ code: "FORBIDDEN", message: "You cannot create snippets here." });
    }

    const insert: TablesInsert<"snippets"> = {
      workspace_id: context.workspaceId,
      project_id: normalize(parsed.data.projectId),
      title: normalize(parsed.data.title),
      content: parsed.data.content,
      language: normalize(parsed.data.language),
      type: deriveType(parsed.data.language),
      tags: parsed.data.tags ?? [],
      visibility: parsed.data.visibility ?? DEFAULT_SNIPPET_VISIBILITY,
      created_by: context.userId,
      updated_by: context.userId,
    };

    const row = await repository.insertSnippetRow(client, insert);
    const collectionIds = parsed.data.collectionIds ?? [];
    await repository.setSnippetCollections(client, context.workspaceId, row.id, collectionIds);

    return ok(mapSnippetRow(row, collectionIds));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function updateSnippet(
  id: string,
  values: SnippetFormValues,
): Promise<ActionResult<Snippet>> {
  const parsed = snippetFormSchema.safeParse(values);
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
    if (!getSnippetPermissions(context.role).canEdit) {
      return err({ code: "FORBIDDEN", message: "You cannot edit this snippet." });
    }

    const row = await repository.updateSnippetRow(client, context.workspaceId, id, {
      project_id: normalize(parsed.data.projectId),
      title: normalize(parsed.data.title),
      content: parsed.data.content,
      language: normalize(parsed.data.language),
      type: deriveType(parsed.data.language),
      visibility: parsed.data.visibility ?? DEFAULT_SNIPPET_VISIBILITY,
      tags: parsed.data.tags ?? [],
      updated_by: context.userId,
    });

    const collectionIds = parsed.data.collectionIds ?? [];
    await repository.setSnippetCollections(client, context.workspaceId, id, collectionIds);

    return ok(mapSnippetRow(row, collectionIds));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function duplicateSnippet(id: string): Promise<ActionResult<Snippet>> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);
    if (!getSnippetPermissions(context.role).canDuplicate) {
      return err({ code: "FORBIDDEN", message: "You cannot duplicate this snippet." });
    }

    const row = await repository.findSnippetRow(client, context.workspaceId, id);
    if (!row) return err({ code: "NOT_FOUND", message: "Snippet not found." });
    const collectionIds = await repository.getSnippetCollectionIds(client, id);

    const copy = await repository.insertSnippetRow(client, {
      workspace_id: context.workspaceId,
      project_id: row.project_id,
      title: `${row.title ?? "Untitled"} (copy)`,
      content: row.content,
      language: row.language,
      type: row.type,
      tags: row.tags,
      visibility: row.visibility,
      created_by: context.userId,
      updated_by: context.userId,
    });
    await repository.setSnippetCollections(client, context.workspaceId, copy.id, collectionIds);

    return ok(mapSnippetRow(copy, collectionIds));
  } catch (error) {
    return err(toActionError(error));
  }
}

async function patchSnippet(
  id: string,
  patch: TablesUpdate<"snippets">,
  requires: "canArchive" | "canFavorite" | "canEdit" | "canDelete",
): Promise<ActionResult<Snippet>> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);
    if (!getSnippetPermissions(context.role)[requires]) {
      return err({ code: "FORBIDDEN", message: "You do not have permission to do that." });
    }

    const row = await repository.updateSnippetRow(client, context.workspaceId, id, {
      ...patch,
      updated_by: context.userId,
    });
    return ok(mapSnippetRow(row));
  } catch (error) {
    return err(toActionError(error));
  }
}

export function setArchived(id: string, archived: boolean): Promise<ActionResult<Snippet>> {
  return patchSnippet(id, { archived }, "canArchive");
}

export function setFavorite(id: string, favorite: boolean): Promise<ActionResult<Snippet>> {
  return patchSnippet(id, { favorite }, "canFavorite");
}

export function setPinned(id: string, pinned: boolean): Promise<ActionResult<Snippet>> {
  return patchSnippet(id, { pinned }, "canEdit");
}

export function moveToProject(
  id: string,
  projectId: string | null,
): Promise<ActionResult<Snippet>> {
  return patchSnippet(id, { project_id: projectId }, "canEdit");
}

export async function softDeleteSnippet(id: string): Promise<ActionResult> {
  const result = await patchSnippet(id, { deleted_at: new Date().toISOString() }, "canDelete");
  return result.ok ? ok(undefined) : result;
}

export async function permanentlyDeleteSnippet(id: string): Promise<ActionResult> {
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);
    if (!getSnippetPermissions(context.role).canPermanentDelete) {
      return err({ code: "FORBIDDEN", message: "Only owners and admins can permanently delete." });
    }
    await repository.deleteSnippetRow(client, context.workspaceId, id);
    return ok(undefined);
  } catch (error) {
    return err(toActionError(error));
  }
}

async function bulk(
  ids: string[],
  patch: { archived?: boolean; deleted_at?: string },
  requires: "canArchive" | "canDelete",
): Promise<ActionResult<{ count: number }>> {
  if (ids.length === 0) return ok({ count: 0 });
  try {
    const client = await createServerSupabaseClient();
    const context = await repository.resolveContext(client);
    if (!context) return err(NO_WORKSPACE);
    if (!getSnippetPermissions(context.role)[requires]) {
      return err({ code: "FORBIDDEN", message: "You do not have permission to do that." });
    }
    await repository.bulkUpdateSnippetRows(client, context.workspaceId, ids, {
      ...patch,
      updated_by: context.userId,
    });
    return ok({ count: ids.length });
  } catch (error) {
    return err(toActionError(error));
  }
}

export function bulkArchiveSnippets(ids: string[]): Promise<ActionResult<{ count: number }>> {
  return bulk(ids, { archived: true }, "canArchive");
}

export function bulkDeleteSnippets(ids: string[]): Promise<ActionResult<{ count: number }>> {
  return bulk(ids, { deleted_at: new Date().toISOString() }, "canDelete");
}
