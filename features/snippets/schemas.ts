import { z, type ZodError } from "zod";

import {
  MAX_CONTENT_LENGTH,
  MAX_TAG_LENGTH,
  MAX_TAGS,
  MAX_TITLE_LENGTH,
} from "@/features/snippets/constants";

/**
 * Snippets feature — validation schemas (shared by client forms and the
 * server-side service).
 */
export const snippetFormSchema = z.object({
  title: z.string().trim().max(MAX_TITLE_LENGTH, "Title is too long.").optional(),
  content: z
    .string()
    .min(1, "Content is required.")
    .max(MAX_CONTENT_LENGTH, "Content exceeds the maximum size."),
  language: z.string().trim().max(40).optional(),
  projectId: z.string().uuid().optional().or(z.literal("")),
  visibility: z.enum(["private", "workspace", "public"]).optional(),
  tags: z
    .array(z.string().trim().min(1).max(MAX_TAG_LENGTH))
    .max(MAX_TAGS, "Too many tags.")
    .optional(),
  collectionIds: z.array(z.string().uuid()).optional(),
});

export type SnippetFormValues = z.infer<typeof snippetFormSchema>;

export const snippetListParamsSchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: z.enum(["active", "archived"]).optional(),
  sort: z.enum(["updated", "created", "title", "favorite"]).optional(),
  projectId: z.string().uuid().optional(),
  language: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export function toFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const result: Record<string, string[]> = {};
  for (const key in fieldErrors) {
    const value = fieldErrors[key];
    if (value && value.length > 0) {
      result[key] = value;
    }
  }
  return result;
}
