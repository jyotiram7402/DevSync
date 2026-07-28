import { z } from "zod";

/**
 * Generic, reusable Zod validators.
 *
 * Cross-cutting building blocks (email, URL, non-empty string) shared by forms
 * and Server Actions. Feature-specific schemas live in their own feature's
 * `schemas/` directory. Keeping these generic avoids duplicating primitive
 * validation rules across the app.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.");

export const urlSchema = z.string().trim().url("Please enter a valid URL.");

export const nonEmptyStringSchema = z.string().trim().min(1, "This field is required.");

/** Returns whether a value is a valid email address. */
export function isValidEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}

/** Returns whether a value is a valid URL. */
export function isValidUrl(value: string): boolean {
  return urlSchema.safeParse(value).success;
}
