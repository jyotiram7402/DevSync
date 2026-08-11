"use server";

import { revalidatePath } from "next/cache";

import type { NoteFormValues, NotePatchValues, QuickNoteValues } from "@/features/notes/schemas";
import * as service from "@/features/notes/services/note-service";
import type { Note } from "@/features/notes/types";
import type { ActionResult } from "@/types/api";

const NOTES_PATH = "/dashboard/notes";
const HOME_PATH = "/dashboard/home";

function revalidate() {
  revalidatePath(NOTES_PATH);
  revalidatePath(HOME_PATH);
}

export async function createNoteAction(values: NoteFormValues): Promise<ActionResult<Note>> {
  const result = await service.createNote(values);
  if (result.ok) revalidate();
  return result;
}

export async function quickCreateNoteAction(values: QuickNoteValues): Promise<ActionResult<Note>> {
  const result = await service.quickCreateNote(values);
  if (result.ok) revalidate();
  return result;
}

export async function updateNoteAction(
  id: string,
  values: NoteFormValues,
): Promise<ActionResult<Note>> {
  const result = await service.updateNote(id, values);
  if (result.ok) revalidate();
  return result;
}

export async function patchNoteAction(
  id: string,
  values: NotePatchValues,
): Promise<ActionResult<Note>> {
  const result = await service.patchNote(id, values);
  if (result.ok) revalidate();
  return result;
}

export async function deleteNoteAction(id: string): Promise<ActionResult> {
  const result = await service.deleteNote(id);
  if (result.ok) revalidate();
  return result;
}
