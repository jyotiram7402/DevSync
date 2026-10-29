/** Longest title taken from the first line of untitled text. */
const DERIVED_TITLE_LENGTH = 90;

/**
 * Title and preview for untitled text (snippets, Space items): the first
 * non-empty line is the title — for an error that's the message itself — and
 * the rest is the preview, so lists never read "Untitled" over and over.
 * Display only: the stored text is never changed.
 */
export function titleFromText(text: string, emptyTitle: string): { title: string; preview: string } {
  const lines = text.split(/\r?\n/);
  const firstIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstIndex === -1) return { title: emptyTitle, preview: "" };
  const first = (lines[firstIndex] ?? "").trim();
  const title = first.length > DERIVED_TITLE_LENGTH ? `${first.slice(0, DERIVED_TITLE_LENGTH - 1)}…` : first;
  const rest = first.length > DERIVED_TITLE_LENGTH ? text : lines.slice(firstIndex + 1).join("\n");
  return { title, preview: rest.trim().length > 0 ? rest : "" };
}
