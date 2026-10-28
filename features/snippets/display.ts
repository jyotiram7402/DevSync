import type { Snippet } from "@/features/snippets/types";

/** Longest title taken from the first line of an untitled snippet. */
const DERIVED_TITLE_LENGTH = 90;

/**
 * Title and preview for a snippet. Untitled captures (most of them) use their
 * first line as the title — for an error that's the message itself — and the
 * rest as the preview, so lists never read "Untitled" over and over. Display
 * only: nothing is stored.
 */
export function snippetTitleAndPreview(snippet: Snippet): { title: string; preview: string } {
  if (snippet.title) return { title: snippet.title, preview: snippet.content };
  const lines = snippet.content.split(/\r?\n/);
  const firstIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstIndex === -1) return { title: "Empty snippet", preview: "" };
  const first = (lines[firstIndex] ?? "").trim();
  const title = first.length > DERIVED_TITLE_LENGTH ? `${first.slice(0, DERIVED_TITLE_LENGTH - 1)}…` : first;
  const rest = first.length > DERIVED_TITLE_LENGTH ? snippet.content : lines.slice(firstIndex + 1).join("\n");
  return { title, preview: rest.trim().length > 0 ? rest : "" };
}
