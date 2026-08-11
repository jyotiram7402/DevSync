import { z } from "zod";

export { toFieldErrors } from "@/features/snippets/schemas";

/** ISO date (YYYY-MM-DD) and 24h time (HH:MM), both optional/nullable. */
const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
  .optional()
  .or(z.literal(""));
const timeField = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Use a valid time.")
  .optional()
  .or(z.literal(""));

export const priorityEnum = z.enum(["low", "medium", "high"]);

/** Full create/edit form. */
export const noteFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200, "Title is too long."),
  content: z.string().trim().max(10000, "Content is too long.").optional(),
  priority: priorityEnum.optional(),
  dueDate: dateField,
  dueTime: timeField,
  tags: z.array(z.string().trim().min(1).max(40)).max(20, "Too many tags.").optional(),
});
export type NoteFormValues = z.infer<typeof noteFormSchema>;

/** Fast path: just a title (+ optional due) for the Quick Add box. */
export const quickNoteSchema = z.object({
  title: z.string().trim().min(1, "Add a title.").max(200, "Title is too long."),
  dueDate: dateField,
  dueTime: timeField,
});
export type QuickNoteValues = z.infer<typeof quickNoteSchema>;

/** Partial mutations (complete/pin/priority/archive/due/tags). */
export const notePatchSchema = z.object({
  status: z.enum(["pending", "completed"]).optional(),
  priority: priorityEnum.optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
  dueDate: z.union([dateField, z.null()]).optional(),
  dueTime: z.union([timeField, z.null()]).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
});
export type NotePatchValues = z.infer<typeof notePatchSchema>;

export const noteListParamsSchema = z.object({
  status: z.enum(["active", "completed", "archived"]).optional(),
  priority: priorityEnum.optional(),
  tag: z.string().trim().max(40).optional(),
  due: z.enum(["today", "overdue", "upcoming"]).optional(),
  sort: z.enum(["due", "created", "updated", "priority"]).optional(),
});
