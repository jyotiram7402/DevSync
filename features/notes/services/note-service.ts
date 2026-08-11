import "server-only";

import { mapNoteRow, mapNoteRows } from "@/features/notes/services/note-mapper";
import * as repository from "@/features/notes/services/note-repository";
import {
  noteFormSchema,
  notePatchSchema,
  quickNoteSchema,
  toFieldErrors,
  type NoteFormValues,
  type NotePatchValues,
  type QuickNoteValues,
} from "@/features/notes/schemas";
import type { Note, NoteBuckets, NoteListParams } from "@/features/notes/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionError, ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";
import type { TablesInsert, TablesUpdate } from "@/types/database";

/**
 * NoteService — server-side orchestration: resolves the authenticated user,
 * validates (Zod), delegates to the repository + mapper, returns ActionResult.
 * Notes are strictly personal; RLS is the security boundary.
 */
const UNAUTHENTICATED: ActionError = { code: "UNAUTHENTICATED", message: "You must be signed in." };

function toActionError(error: unknown): ActionError {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";
  if (/row-level security|violates row-level|permission denied/i.test(message)) {
    return { code: "FORBIDDEN", message: "You do not have access to that note." };
  }
  // eslint-disable-next-line no-console
  console.error("[notes] service error:", message);
  return { code: "INTERNAL", message: "Something went wrong. Please try again." };
}

function optional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function listNotes(params: NoteListParams): Promise<ActionResult<Note[]>> {
  try {
    const client = await createServerSupabaseClient();
    const userId = await repository.resolveUserId(client);
    if (!userId) return err(UNAUTHENTICATED);
    return ok(mapNoteRows(await repository.listNoteRows(client, userId, params)));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function getNoteBuckets(): Promise<ActionResult<NoteBuckets>> {
  try {
    const client = await createServerSupabaseClient();
    const userId = await repository.resolveUserId(client);
    if (!userId) return err(UNAUTHENTICATED);

    const [rows, completedCount] = await Promise.all([
      repository.listActiveNoteRows(client, userId),
      repository.countCompleted(client, userId),
    ]);
    const notes = mapNoteRows(rows);
    const today = new Date().toISOString().slice(0, 10);

    return ok({
      overdue: notes.filter((n) => n.dueDate !== null && n.dueDate < today),
      today: notes.filter((n) => n.dueDate === today),
      upcoming: notes.filter((n) => n.dueDate !== null && n.dueDate > today),
      completedCount,
    });
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function createNote(values: NoteFormValues): Promise<ActionResult<Note>> {
  const parsed = noteFormSchema.safeParse(values);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_FAILED",
      message: "Please check the form.",
      fieldErrors: toFieldErrors(parsed.error),
    });
  }
  try {
    const client = await createServerSupabaseClient();
    const userId = await repository.resolveUserId(client);
    if (!userId) return err(UNAUTHENTICATED);

    const insert: TablesInsert<"notes"> = {
      user_id: userId,
      title: parsed.data.title,
      content: optional(parsed.data.content) ?? "",
      priority: parsed.data.priority ?? "medium",
      due_date: optional(parsed.data.dueDate),
      due_time: optional(parsed.data.dueTime),
      tags: parsed.data.tags ?? [],
    };
    return ok(mapNoteRow(await repository.insertNoteRow(client, insert)));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function quickCreateNote(values: QuickNoteValues): Promise<ActionResult<Note>> {
  const parsed = quickNoteSchema.safeParse(values);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_FAILED",
      message: "Add a title.",
      fieldErrors: toFieldErrors(parsed.error),
    });
  }
  try {
    const client = await createServerSupabaseClient();
    const userId = await repository.resolveUserId(client);
    if (!userId) return err(UNAUTHENTICATED);

    const insert: TablesInsert<"notes"> = {
      user_id: userId,
      title: parsed.data.title,
      due_date: optional(parsed.data.dueDate),
      due_time: optional(parsed.data.dueTime),
    };
    return ok(mapNoteRow(await repository.insertNoteRow(client, insert)));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function updateNote(id: string, values: NoteFormValues): Promise<ActionResult<Note>> {
  const parsed = noteFormSchema.safeParse(values);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_FAILED",
      message: "Please check the form.",
      fieldErrors: toFieldErrors(parsed.error),
    });
  }
  try {
    const client = await createServerSupabaseClient();
    const userId = await repository.resolveUserId(client);
    if (!userId) return err(UNAUTHENTICATED);

    const patch: TablesUpdate<"notes"> = {
      title: parsed.data.title,
      content: optional(parsed.data.content) ?? "",
      priority: parsed.data.priority ?? "medium",
      due_date: optional(parsed.data.dueDate),
      due_time: optional(parsed.data.dueTime),
      tags: parsed.data.tags ?? [],
    };
    return ok(mapNoteRow(await repository.updateNoteRow(client, userId, id, patch)));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function patchNote(id: string, values: NotePatchValues): Promise<ActionResult<Note>> {
  const parsed = notePatchSchema.safeParse(values);
  if (!parsed.success) {
    return err({ code: "VALIDATION_FAILED", message: "Invalid change." });
  }
  try {
    const client = await createServerSupabaseClient();
    const userId = await repository.resolveUserId(client);
    if (!userId) return err(UNAUTHENTICATED);

    const patch: TablesUpdate<"notes"> = {};
    const d = parsed.data;
    if (d.status !== undefined) {
      patch.status = d.status;
      patch.completed_at = d.status === "completed" ? new Date().toISOString() : null;
    }
    if (d.priority !== undefined) patch.priority = d.priority;
    if (d.pinned !== undefined) patch.pinned = d.pinned;
    if (d.archived !== undefined) patch.archived = d.archived;
    if (d.dueDate !== undefined) patch.due_date = d.dueDate ? d.dueDate : null;
    if (d.dueTime !== undefined) patch.due_time = d.dueTime ? d.dueTime : null;
    if (d.tags !== undefined) patch.tags = d.tags;

    return ok(mapNoteRow(await repository.updateNoteRow(client, userId, id, patch)));
  } catch (error) {
    return err(toActionError(error));
  }
}

export async function deleteNote(id: string): Promise<ActionResult> {
  try {
    const client = await createServerSupabaseClient();
    const userId = await repository.resolveUserId(client);
    if (!userId) return err(UNAUTHENTICATED);
    await repository.deleteNoteRow(client, userId, id);
    return ok(undefined);
  } catch (error) {
    return err(toActionError(error));
  }
}
