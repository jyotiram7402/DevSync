import type { SnippetSort, SnippetStatus, SnippetVisibility } from "@/features/snippets/types";

export const SNIPPET_PAGE_SIZE = 12;

/** Must match the DB check constraint on snippets.content (0002 migration). */
export const MAX_CONTENT_LENGTH = 100000;
export const MAX_TITLE_LENGTH = 200;
export const MAX_TAGS = 50;
export const MAX_TAG_LENGTH = 40;

export const SNIPPET_STATUS_OPTIONS: ReadonlyArray<{ value: SnippetStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export const SNIPPET_SORT_OPTIONS: ReadonlyArray<{ value: SnippetSort; label: string }> = [
  { value: "updated", label: "Last updated" },
  { value: "created", label: "Date created" },
  { value: "title", label: "Title" },
  { value: "favorite", label: "Favorites first" },
];

export const SNIPPET_VISIBILITY_OPTIONS: ReadonlyArray<{
  value: SnippetVisibility;
  label: string;
  description: string;
}> = [
  { value: "private", label: "Private", description: "Only you can see this snippet." },
  { value: "workspace", label: "Workspace", description: "Everyone in the workspace can see it." },
  { value: "public", label: "Public", description: "Anyone with the link can view it." },
];

export const DEFAULT_SNIPPET_STATUS: SnippetStatus = "active";
export const DEFAULT_SNIPPET_SORT: SnippetSort = "updated";
export const DEFAULT_SNIPPET_VISIBILITY: SnippetVisibility = "private";
