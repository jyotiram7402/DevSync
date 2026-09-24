"use server";

import { revalidatePath } from "next/cache";

import type {
  CreateSpaceValues,
  InviteMemberValues,
  JoinSpaceValues,
  ShareFileValues,
  ShareTextValues,
} from "@/features/spaces/schemas";
import * as service from "@/features/spaces/services/space-service";
import type { Space, SpaceItem } from "@/features/spaces/types";
import type { ActionResult } from "@/types/api";

const SPACES_PATH = "/dashboard/spaces";

function roomPath(id: string) {
  return `${SPACES_PATH}/${id}`;
}

export async function createSpaceAction(values: CreateSpaceValues): Promise<ActionResult<Space>> {
  const result = await service.createSpace(values);
  if (result.ok) revalidatePath(SPACES_PATH);
  return result;
}

export async function joinSpaceAction(values: JoinSpaceValues): Promise<ActionResult<Space>> {
  const result = await service.joinSpace(values);
  if (result.ok) revalidatePath(SPACES_PATH);
  return result;
}

export async function shareTextAction(
  spaceId: string,
  values: ShareTextValues,
): Promise<ActionResult<SpaceItem>> {
  const result = await service.shareText(spaceId, values);
  if (result.ok) revalidatePath(roomPath(spaceId));
  return result;
}

export async function shareFileAction(
  spaceId: string,
  values: ShareFileValues,
): Promise<ActionResult<SpaceItem>> {
  const result = await service.shareFile(spaceId, values);
  if (result.ok) revalidatePath(roomPath(spaceId));
  return result;
}

export async function deleteSpaceItemAction(
  spaceId: string,
  itemId: string,
): Promise<ActionResult> {
  const result = await service.deleteItem(itemId);
  if (result.ok) revalidatePath(roomPath(spaceId));
  return result;
}

export async function inviteMemberAction(
  spaceId: string,
  values: InviteMemberValues,
): Promise<ActionResult<{ status: "added" | "already_member" }>> {
  const result = await service.inviteMember(spaceId, values);
  if (result.ok) revalidatePath(roomPath(spaceId));
  return result;
}

export async function removeMemberAction(spaceId: string, userId: string): Promise<ActionResult> {
  const result = await service.removeMember(spaceId, userId);
  if (result.ok) revalidatePath(roomPath(spaceId));
  return result;
}

export async function leaveSpaceAction(spaceId: string): Promise<ActionResult> {
  const result = await service.leaveSpace(spaceId);
  if (result.ok) revalidatePath(SPACES_PATH);
  return result;
}

export async function deleteSpaceAction(spaceId: string): Promise<ActionResult> {
  const result = await service.deleteSpace(spaceId);
  if (result.ok) revalidatePath(SPACES_PATH);
  return result;
}
