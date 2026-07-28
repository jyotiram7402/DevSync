"use server";

import { revalidatePath } from "next/cache";

import type { ProjectFormValues } from "@/features/projects/schemas";
import * as service from "@/features/projects/services/project-service";
import type { Project } from "@/features/projects/types";
import type { ActionResult } from "@/types/api";

/**
 * Server Actions — the client-callable boundary for project mutations. Each
 * delegates to the (server-only) ProjectService and revalidates affected routes
 * so server-rendered lists/details refresh.
 */
const LIST_PATH = "/dashboard/projects";

function detailPath(id: string): string {
  return `${LIST_PATH}/${id}`;
}

export async function createProjectAction(
  values: ProjectFormValues,
): Promise<ActionResult<Project>> {
  const result = await service.createProject(values);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}

export async function updateProjectAction(
  id: string,
  values: ProjectFormValues,
): Promise<ActionResult<Project>> {
  const result = await service.updateProject(id, values);
  if (result.ok) {
    revalidatePath(LIST_PATH);
    revalidatePath(detailPath(id));
  }
  return result;
}

export async function archiveProjectAction(id: string): Promise<ActionResult<Project>> {
  const result = await service.setArchived(id, true);
  if (result.ok) {
    revalidatePath(LIST_PATH);
    revalidatePath(detailPath(id));
  }
  return result;
}

export async function restoreProjectAction(id: string): Promise<ActionResult<Project>> {
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
): Promise<ActionResult<Project>> {
  const result = await service.setFavorite(id, favorite);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}

export async function togglePinAction(
  id: string,
  pinned: boolean,
): Promise<ActionResult<Project>> {
  const result = await service.setPinned(id, pinned);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}

export async function softDeleteProjectAction(id: string): Promise<ActionResult> {
  const result = await service.softDeleteProject(id);
  if (result.ok) {
    revalidatePath(LIST_PATH);
    revalidatePath(detailPath(id));
  }
  return result;
}

export async function permanentlyDeleteProjectAction(id: string): Promise<ActionResult> {
  const result = await service.permanentlyDeleteProject(id);
  if (result.ok) revalidatePath(LIST_PATH);
  return result;
}
