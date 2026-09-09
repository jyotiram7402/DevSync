import "server-only";

import {
  createSpaceSchema,
  joinSpaceSchema,
  shareFileSchema,
  shareTextSchema,
  toFieldErrors,
  type CreateSpaceValues,
  type JoinSpaceValues,
  type ShareFileValues,
  type ShareTextValues,
} from "@/features/spaces/schemas";
import { mapItemRow, mapItemRows, mapSpaceRow } from "@/features/spaces/services/space-mapper";
import * as repository from "@/features/spaces/services/space-repository";
import type { Space, SpaceItem, SpaceView } from "@/features/spaces/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionError, ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";
import type { TablesInsert } from "@/types/database";

const UNAUTHENTICATED: ActionError = { code: "UNAUTHENTICATED", message: "You must be signed in." };

function toActionError(error: unknown): ActionError {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";
  if (/SPACE_NOT_FOUND/.test(message)) {
    return { code: "NOT_FOUND", message: "That room code isn't valid or has expired." };
  }
  if (/row-level security|violates row-level|permission denied/i.test(message)) {
    return { code: "FORBIDDEN", message: "You don't have access to that room." };
  }
  // eslint-disable-next-line no-console
  console.error("[spaces] service error:", message);
  return { code: "INTERNAL", message: "Something went wrong. Please try again." };
}

/** Friendly, low-PII label for who shared something (email local-part). */
function authorLabel(email: string | null): string {
  if (!email) return "Someone";
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
}

/** Rough text classification: an http(s) link becomes a 'url' item. */
function classifyText(content: string): "url" | "text" {
  return /^https?:\/\/\S+$/i.test(content.trim()) ? "url" : "text";
}

export async function createSpace(values: CreateSpaceValues): Promise<ActionResult<Space>> {
  const parsed = createSpaceSchema.safeParse(values);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_FAILED",
      message: "Please check the name.",
      fieldErrors: toFieldErrors(parsed.error),
    });
  }
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);
    const row = await repository.rpcCreateSpace(client, parsed.data.name ?? "");
    return ok(mapSpaceRow(row));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function joinSpace(values: JoinSpaceValues): Promise<ActionResult<Space>> {
  const parsed = joinSpaceSchema.safeParse(values);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_FAILED",
      message: "Enter a valid room code.",
      fieldErrors: toFieldErrors(parsed.error),
    });
  }
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);
    const row = await repository.rpcJoinSpace(client, parsed.data.code);
    return ok(mapSpaceRow(row));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function listMySpaces(): Promise<ActionResult<Space[]>> {
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);
    const rows = await repository.listMySpaceRows(client);
    return ok(rows.map(mapSpaceRow));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function getSpaceView(spaceId: string): Promise<ActionResult<SpaceView>> {
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);

    const spaceRow = await repository.getSpaceRow(client, spaceId);
    if (!spaceRow) return err({ code: "NOT_FOUND", message: "Room not found." });

    const [itemRows, memberCount] = await Promise.all([
      repository.listItemRows(client, spaceId),
      repository.countMembers(client, spaceId),
    ]);

    return ok({
      space: mapSpaceRow(spaceRow),
      items: mapItemRows(itemRows, user.id),
      memberCount,
      isOwner: spaceRow.created_by === user.id,
      currentUserId: user.id,
    });
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function shareText(
  spaceId: string,
  values: ShareTextValues,
): Promise<ActionResult<SpaceItem>> {
  const parsed = shareTextSchema.safeParse(values);
  if (!parsed.success) {
    return err({ code: "VALIDATION_FAILED", message: "Nothing to share." });
  }
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);

    const insert: TablesInsert<"space_items"> = {
      space_id: spaceId,
      user_id: user.id,
      kind: classifyText(parsed.data.content),
      content: parsed.data.content,
      metadata: { by: authorLabel(user.email) },
    };
    const row = await repository.insertItemRow(client, insert);
    return ok(mapItemRow(row, user.id));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function shareFile(
  spaceId: string,
  values: ShareFileValues,
): Promise<ActionResult<SpaceItem>> {
  const parsed = shareFileSchema.safeParse(values);
  if (!parsed.success) {
    return err({ code: "VALIDATION_FAILED", message: "That file could not be shared." });
  }
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);

    const insert: TablesInsert<"space_items"> = {
      space_id: spaceId,
      user_id: user.id,
      kind: parsed.data.kind,
      content: parsed.data.name,
      metadata: {
        by: authorLabel(user.email),
        path: parsed.data.path,
        mimeType: parsed.data.mimeType,
        size: parsed.data.size,
        kind: parsed.data.kind,
      },
    };
    const row = await repository.insertItemRow(client, insert);
    return ok(mapItemRow(row, user.id));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function deleteItem(itemId: string): Promise<ActionResult> {
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);
    await repository.deleteItemRow(client, itemId);
    return ok(undefined);
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function leaveSpace(spaceId: string): Promise<ActionResult> {
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);
    await repository.leaveSpaceRow(client, spaceId, user.id);
    return ok(undefined);
  } catch (error) {
    return err(toActionError(error));
  }
}
