import type { ProjectSort, ProjectStatus } from "@/features/projects/types";

/** Projects per page in the list view. */
export const PROJECT_PAGE_SIZE = 12;

/**
 * Project color registry. The color is stored by key on the project; classes
 * are STATIC strings so Tailwind can detect them. They point at the
 * `project-*` color tokens (styles/globals.css), which have light and dark
 * values that keep the icon readable on its tint. `swatch` fills the picker
 * circle; `surface` styles the icon tile.
 */
export interface ProjectColor {
  key: string;
  label: string;
  swatch: string;
  surface: string;
}

export const PROJECT_COLORS: readonly ProjectColor[] = [
  { key: "zinc", label: "Gray", swatch: "bg-project-zinc", surface: "bg-project-zinc/10 text-project-zinc" },
  { key: "red", label: "Red", swatch: "bg-project-red", surface: "bg-project-red/10 text-project-red" },
  { key: "orange", label: "Orange", swatch: "bg-project-orange", surface: "bg-project-orange/10 text-project-orange" },
  { key: "amber", label: "Amber", swatch: "bg-project-amber", surface: "bg-project-amber/10 text-project-amber" },
  { key: "green", label: "Green", swatch: "bg-project-green", surface: "bg-project-green/10 text-project-green" },
  { key: "blue", label: "Blue", swatch: "bg-project-blue", surface: "bg-project-blue/10 text-project-blue" },
  { key: "indigo", label: "Indigo", swatch: "bg-project-indigo", surface: "bg-project-indigo/10 text-project-indigo" },
  { key: "violet", label: "Violet", swatch: "bg-project-violet", surface: "bg-project-violet/10 text-project-violet" },
  { key: "pink", label: "Pink", swatch: "bg-project-pink", surface: "bg-project-pink/10 text-project-pink" },
];

export const DEFAULT_PROJECT_COLOR = "zinc";

const DEFAULT_SURFACE = PROJECT_COLORS[0]?.surface ?? "bg-muted text-muted-foreground";

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
  { value: "created", label: "Newest" },
  { value: "name", label: "Name" },
  { value: "favorite", label: "Favorites first" },
];

export const DEFAULT_PROJECT_STATUS: ProjectStatus = "active";
export const DEFAULT_PROJECT_SORT: ProjectSort = "updated";

/** How the list is shown. `table` is the old name of `list`, kept so saved links still work. */
export type ProjectView = "grid" | "list";

export function parseProjectView(value: string | null | undefined): ProjectView {
  return value === "list" || value === "table" ? "list" : "grid";
}

/** One line on what Projects are for (list page, loading state, empty state). */
export const PROJECTS_PURPOSE = "Group your snippets by what you're working on: an app, a client, a course.";
