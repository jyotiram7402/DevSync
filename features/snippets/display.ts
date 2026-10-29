import type { Snippet } from "@/features/snippets/types";
import { titleFromText } from "@/lib/item-text";

/**
 * Title and preview for a snippet. Untitled captures (most of them) use their
 * first line as the title and the rest as the preview. Display only: nothing
 * is stored.
 */
export function snippetTitleAndPreview(snippet: Snippet): { title: string; preview: string } {
  if (snippet.title) return { title: snippet.title, preview: snippet.content };
  return titleFromText(snippet.content, "Empty snippet");
}
