import type { Note, NotePriority, NoteStatus } from "@/features/notes/types";
import type { Tables } from "@/types/database";

export function mapNoteRow(row: Tables<"notes">): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    status: (row.status === "completed" ? "completed" : "pending") as NoteStatus,
    priority: (["low", "medium", "high"].includes(row.priority)
      ? row.priority
      : "medium") as NotePriority,
    dueDate: row.due_date,
    dueTime: row.due_time ? row.due_time.slice(0, 5) : null,
    tags: row.tags ?? [],
    pinned: row.pinned,
    archived: row.archived,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapNoteRows(rows: Tables<"notes">[]): Note[] {
  return rows.map(mapNoteRow);
}
