/** Quick Notes — domain types (app-facing, camelCase). */
export type NoteStatus = "pending" | "completed";
export type NotePriority = "low" | "medium" | "high";
export type NoteSort = "due" | "created" | "updated" | "priority";
export type NoteStatusFilter = "active" | "completed" | "archived";

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: NoteStatus;
  priority: NotePriority;
  dueDate: string | null;
  dueTime: string | null;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteListParams {
  status?: NoteStatusFilter | undefined;
  priority?: NotePriority | undefined;
  tag?: string | undefined;
  due?: "today" | "overdue" | "upcoming" | undefined;
  sort?: NoteSort | undefined;
}

/** Buckets used by the widget + smart filters. */
export interface NoteBuckets {
  overdue: Note[];
  today: Note[];
  upcoming: Note[];
  completedCount: number;
}
