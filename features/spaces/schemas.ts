import { z } from "zod";

export { toFieldErrors } from "@/features/snippets/schemas";

/** Create a room. The name is usually the project (e.g. "GeoReminder Android"). */
export const createSpaceSchema = z.object({
  name: z.string().trim().max(80, "Name is too long.").optional(),
});
export type CreateSpaceValues = z.infer<typeof createSpaceSchema>;

/** Join a room by its shared code. */
export const joinSpaceSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "Enter the room code.")
    .max(12, "That code is too long."),
});
export type JoinSpaceValues = z.infer<typeof joinSpaceSchema>;

/** Share a piece of text or a link into a room, filed as an error or code. */
export const shareTextSchema = z.object({
  content: z.string().trim().min(1, "Nothing to share.").max(20000, "That's too long to share."),
  category: z.enum(["error", "code"]),
});
export type ShareTextValues = z.infer<typeof shareTextSchema>;

/** Register an already-uploaded file as a shared item. */
export const shareFileSchema = z.object({
  path: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  kind: z.string().min(1),
});
export type ShareFileValues = z.infer<typeof shareFileSchema>;

/** Add an existing CopyAnywhere user to a room by email. */
export const inviteMemberSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
});
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
