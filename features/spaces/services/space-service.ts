import "server-only";

import {
  createSpaceSchema,
  inviteMemberSchema,
  joinSpaceSchema,
  shareFileSchema,
  shareTextSchema,
  toFieldErrors,
  type CreateSpaceValues,
  type InviteMemberValues,
  type JoinSpaceValues,
  type ShareFileValues,
  type ShareTextValues,
} from "@/features/spaces/schemas";
import {
  mapItemRow,
  mapItemRows,
  mapMemberRows,
  mapSpaceRow,
} from "@/features/spaces/services/space-mapper";
import * as repository from "@/features/spaces/services/space-repository";
import type { Space, SpaceCategory, SpaceItem, SpaceView } from "@/features/spaces/types";
import { deleteFiles } from "@/lib/storage/storage";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionError, ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";
import type { TablesInsert } from "@/types/database";

const BUCKET = "space-attachments" as const;
const UNAUTHENTICATED: ActionError = { code: "UNAUTHENTICATED", message: "You must be signed in." };
const NOT_FOUND: ActionError = { code: "NOT_FOUND", message: "Room not found." };

function toActionError(error: unknown): ActionError {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";
  if (/SPACE_NOT_FOUND/.test(message)) {
    return { code: "NOT_FOUND", message: "That room code isn't valid." };
  }
  if (/USER_NOT_FOUND/.test(message)) {
    return {
      code: "NOT_FOUND",
      message: "No CopyAnywhere account uses that email. Ask them to sign up first, or share the room code.",
    };
  }
  if (/NOT_A_MEMBER|row-level security|violates row-level|permission denied/i.test(message)) {
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

/** Files land in the Docs tab (PDF/Office) or the Files tab (everything else). */
function categoryForFile(kind: string): SpaceCategory {
  return kind === "pdf" || kind === "office" ? "doc" : "file";
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
    if (!spaceRow) return err(NOT_FOUND);

    const [itemRows, memberRows] = await Promise.all([
      repository.listItemRows(client, spaceId),
      repository.rpcListMembers(client, spaceId),
    ]);

    return ok({
      space: mapSpaceRow(spaceRow),
      items: mapItemRows(itemRows, user.id),
      members: mapMemberRows(memberRows, user.id),
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
      category: parsed.data.category,
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
      category: categoryForFile(parsed.data.kind),
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

/**
 * Delete one item (author or room owner). Permission is checked HERE before the
 * file is removed: storage lets any member delete objects in the room folder,
 * so we must not rely on the row delete (which silently no-ops under RLS).
 */
export async function deleteItem(itemId: string): Promise<ActionResult> {
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);

    const item = await repository.getItemRow(client, itemId);
    if (!item) return err({ code: "NOT_FOUND", message: "That item no longer exists." });

    const space = await repository.getSpaceRow(client, item.space_id);
    const allowed = item.user_id === user.id || space?.created_by === user.id;
    if (!allowed) {
      return err({ code: "FORBIDDEN", message: "Only the person who shared this, or the room owner, can delete it." });
    }

    await repository.deleteItemRow(client, itemId);

    const meta = (item.metadata ?? {}) as Record<string, unknown>;
    if (typeof meta.path === "string") {
      // Best-effort: the row is already gone, so a failed file delete only leaves an orphan.
      await deleteFiles(client, BUCKET, [meta.path]);
    }
    return ok(undefined);
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function inviteMember(
  spaceId: string,
  values: InviteMemberValues,
): Promise<ActionResult<{ status: "added" | "already_member" }>> {
  const parsed = inviteMemberSchema.safeParse(values);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_FAILED",
      message: "Enter a valid email address.",
      fieldErrors: toFieldErrors(parsed.error),
    });
  }
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);
    const status = await repository.rpcAddMemberByEmail(client, spaceId, parsed.data.email);
    return ok({ status: status === "already_member" ? "already_member" : "added" });
  } catch (error) {
    return err(toActionError(error));
  }
}

/** Owner removes someone else from the room. */
export async function removeMember(spaceId: string, userId: string): Promise<ActionResult> {
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);

    const space = await repository.getSpaceRow(client, spaceId);
    if (!space) return err(NOT_FOUND);
    if (space.created_by !== user.id) {
      return err({ code: "FORBIDDEN", message: "Only the room owner can remove people." });
    }
    if (userId === user.id) {
      return err({ code: "VALIDATION_FAILED", message: "You own this room — delete the room instead." });
    }
    await repository.deleteMemberRow(client, spaceId, userId);
    return ok(undefined);
  } catch (error) {
    return err(toActionError(error));
  }
}

/** Leave a room. The owner can't leave (the room would have no owner). */
export async function leaveSpace(spaceId: string): Promise<ActionResult> {
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);

    const space = await repository.getSpaceRow(client, spaceId);
    if (space?.created_by === user.id) {
      return err({ code: "VALIDATION_FAILED", message: "You own this room — delete it instead of leaving." });
    }
    await repository.deleteMemberRow(client, spaceId, user.id);
    return ok(undefined);
  } catch (error) {
    return err(toActionError(error));
  }
}

/** Owner deletes the room, its shared files, and everything in it. */
export async function deleteSpace(spaceId: string): Promise<ActionResult> {
  try {
    const client = await createServerSupabaseClient();
    const user = await repository.resolveUser(client);
    if (!user) return err(UNAUTHENTICATED);

    const space = await repository.getSpaceRow(client, spaceId);
    if (!space) return err(NOT_FOUND);
    if (space.created_by !== user.id) {
      return err({ code: "FORBIDDEN", message: "Only the room owner can delete it." });
    }

    // Remove files first, while we're still a member (storage policy requires it).
    const items = await repository.listItemRows(client, spaceId);
    const paths = items
      .map((item) => (item.metadata ?? {}) as Record<string, unknown>)
      .map((meta) => meta.path)
      .filter((path): path is string => typeof path === "string");
    if (paths.length > 0) await deleteFiles(client, BUCKET, paths);

    await repository.deleteSpaceRow(client, spaceId);
    return ok(undefined);
  } catch (error) {
    return err(toActionError(error));
  }
}
