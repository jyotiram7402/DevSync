import { z, type ZodError } from "zod";

import { emailSchema } from "@/utils/validation";

/**
 * Auth input schemas (shared by client forms and, where applicable, server
 * flows). Types are inferred with `z.infer` — never duplicated.
 */
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const magicLinkSchema = z.object({ email: emailSchema });
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;

export const oauthProviderSchema = z.enum(["google", "github"]);

/**
 * Normalizes a Zod error's field errors into a `Record<string, string[]>`,
 * dropping empty/undefined entries so it maps cleanly onto form field errors.
 */
export function toFieldErrors(error: ZodError): Record<string, string[]> {
  // Bridge Zod's mapped fieldErrors type to a plain record for iteration.
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
