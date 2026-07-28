import { getLanguage } from "@/features/snippets/languages";
import type { Snippet } from "@/features/snippets/types";

/**
 * ExportService — download a snippet as a file (client-only). No-ops on the
 * server.
 */
function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug.length > 0 ? slug : "snippet";
}

export function getSnippetFileName(snippet: Snippet): string {
  const base = snippet.title && snippet.title.trim().length > 0 ? slugify(snippet.title) : "snippet";
  const extension = getLanguage(snippet.language).extension;
  return `${base}.${extension}`;
}

export function downloadSnippet(snippet: Snippet): void {
  if (typeof document === "undefined") return;

  const blob = new Blob([snippet.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = getSnippetFileName(snippet);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
