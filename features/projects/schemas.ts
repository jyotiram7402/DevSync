import { z, type ZodError } from "zod";

/**
 * Projects feature — validation schemas (shared by client forms and the
 * server-side service). Types are inferred with `z.infer`.
 */
export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer.")
    .optional(),
  icon: z.string().trim().max(40).optional(),
  color: z.string().trim().max(40).optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const projectListParamsSchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.enum(["active", "archived"]).optional(),
  sort: z.enum(["name", "updated", "created", "favorite"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

/** Normalize a Zod error into a flat `Record<string, string[]>` for forms. */
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
