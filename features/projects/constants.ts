import type { ProjectSort, ProjectStatus } from "@/features/projects/types";

/** Projects per page in the list view. */
export const PROJECT_PAGE_SIZE = 12;

/**
 * Project color registry. Stored by key; classes are STATIC strings so
 * Tailwind can detect them (no dynamic class construction). `swatch` is used in
 * the picker; `surface` styles the icon tile.
 */
export interface ProjectColor {
  key: string;
  label: string;
  swatch: string;
  surface: string;
}

export const PROJECT_COLORS: readonly ProjectColor[] = [
  { key: "zinc", label: "Zinc", swatch: "bg-zinc-500", surface: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300" },
  { key: "red", label: "Red", swatch: "bg-red-500", surface: "bg-red-500/10 text-red-500" },
  { key: "orange", label: "Orange", swatch: "bg-orange-500", surface: "bg-orange-500/10 text-orange-500" },
  { key: "amber", label: "Amber", swatch: "bg-amber-500", surface: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { key: "green", label: "Green", swatch: "bg-emerald-500", surface: "bg-emerald-500/10 text-emerald-500" },
  { key: "blue", label: "Blue", swatch: "bg-blue-500", surface: "bg-blue-500/10 text-blue-500" },
  { key: "indigo", label: "Indigo", swatch: "bg-indigo-500", surface: "bg-indigo-500/10 text-indigo-500" },
  { key: "violet", label: "Violet", swatch: "bg-violet-500", surface: "bg-violet-500/10 text-violet-500" },
  { key: "pink", label: "Pink", swatch: "bg-pink-500", surface: "bg-pink-500/10 text-pink-500" },
];

export const DEFAULT_PROJECT_COLOR = "zinc";

const DEFAULT_SURFACE = PROJECT_COLORS[0]?.surface ?? "bg-secondary text-foreground";

/** Resolve a color key to its icon-tile surface classes. */
export function getProjectColorSurface(key: string | null | undefined): string {
  if (!key) return DEFAULT_SURFACE;
  return PROJECT_COLORS.find((color) => color.key === key)?.surface ?? DEFAULT_SURFACE;
}

export const PROJECT_STATUS_OPTIONS: ReadonlyArray<{ value: ProjectStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export const PROJECT_SORT_OPTIONS: ReadonlyArray<{ value: ProjectSort; label: string }> = [
  { value: "updated", label: "Last updated" },
  { value: "created", label: "Date created" },
  { value: "name", label: "Name" },
  { value: "favorite", label: "Favorites first" },
];

export const DEFAULT_PROJECT_STATUS: ProjectStatus = "active";
export const DEFAULT_PROJECT_SORT: ProjectSort = "updated";
