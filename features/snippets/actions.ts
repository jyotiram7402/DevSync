"use server";

import { revalidatePath } from "next/cache";

import type { SnippetFormValues } from "@/features/snippets/schemas";
import * as service from "@/features/snippets/services/snippet-service";
import type { Snippet } from "@/features/snippets/types";
import type { ActionResult } from "@/types/api";

/** Server Actions — client-callable boundary for snippet mutations. */
const LIST_PATH = "/dashboard/snippets";

function detailPath(id: string): string {
  return `${LIST_PATH}/${id}`;
}

export async function createSnippetAction(
  values: SnippetFormValues,
): Promise<ActionResult<Snippet>> {
  const result = await service.createSnippet(values);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}

/** Quick Capture: create a text/URL item (URLs auto-classified into Links). */
export async function createTextCaptureAction(content: string): Promise<ActionResult<Snippet>> {
  const result = await service.createTextCapture(content);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}

/** Quick Capture: create the placeholder row for a file/image before upload. */
export async function createPendingFileSnippetAction(input: {
  name: string;
  mimeType: string;
  size: number;
  kind: string;
}): Promise<ActionResult<{ snippetId: string; workspaceId: string }>> {
  return service.createPendingFileSnippet(input);
}

/** Quick Capture: link the uploaded attachment and reveal the snippet. */
export async function finalizeFileSnippetAction(
  id: string,
  meta: { bucket: string; path: string; mimeType: string; size: number; kind: string },
): Promise<ActionResult<void>> {
  const result = await service.finalizeFileSnippet(id, meta);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}

export async function updateSnippetAction(
  id: string,
  values: SnippetFormValues,
): Promise<ActionResult<Snippet>> {
  const result = await service.updateSnippet(id, values);
  if (result.ok) {
    revalidatePath(LIST_PATH);
    revalidatePath(detailPath(id));
  }
  return result;
}

export async function duplicateSnippetAction(id: string): Promise<ActionResult<Snippet>> {
  const result = await service.duplicateSnippet(id);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}

export async function archiveSnippetAction(id: string): Promise<ActionResult<Snippet>> {
  const result = await service.setArchived(id, true);
  if (result.ok) {
    revalidatePath(LIST_PATH);
    revalidatePath(detailPath(id));
  }
  return result;
}

export async function restoreSnippetAction(id: string): Promise<ActionResult<Snippet>> {
  const result = await service.setArchived(id, false);
  if (result.ok) {
    revalidatePath(LIST_PATH);
    revalidatePath(detailPath(id));
  }
  return result;
}

export async function toggleFavoriteAction(
  id: string,
  favorite: boolean,
): Promise<ActionResult<Snippet>> {
  const result = await service.setFavorite(id, favorite);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}

export async function togglePinAction(id: string, pinned: boolean): Promise<ActionResult<Snippet>> {
  const result = await service.setPinned(id, pinned);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}

export async function moveSnippetAction(
  id: string,
  projectId: string | null,
): Promise<ActionResult<Snippet>> {
  const result = await service.moveToProject(id, projectId);
  if (result.ok) {
    revalidatePath(LIST_PATH);
    revalidatePath(detailPath(id));
  }
  return result;
}

export async function softDeleteSnippetAction(id: string): Promise<ActionResult> {
  const result = await service.softDeleteSnippet(id);
  if (result.ok) {
    revalidatePath(LIST_PATH);
    revalidatePath(detailPath(id));
  }
  return result;
}

export async function permanentlyDeleteSnippetAction(id: string): Promise<ActionResult> {
  const result = await service.permanentlyDeleteSnippet(id);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}

export async function bulkArchiveSnippetsAction(
  ids: string[],
): Promise<ActionResult<{ count: number }>> {
  const result = await service.bulkArchiveSnippets(ids);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}

export async function bulkDeleteSnippetsAction(
  ids: string[],
): Promise<ActionResult<{ count: number }>> {
  const result = await service.bulkDeleteSnippets(ids);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}
