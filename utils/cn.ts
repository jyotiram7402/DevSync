import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 *
 * `clsx` handles conditional/array/object class inputs; `twMerge` ensures that
 * when two conflicting Tailwind utilities are present (e.g. `p-2` and `p-4`),
 * the last one wins. This is the single class-composition helper used across
 * every component in the app.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
