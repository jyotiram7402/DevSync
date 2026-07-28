import type { Snippet } from "@/features/snippets/types";
import { copyToClipboard } from "@/utils/clipboard";

/**
 * ClipboardService — pure formatting + clipboard copy helpers (client-safe).
 */
export function toPlainText(snippet: Snippet): string {
  return snippet.content;
}

export function toMarkdown(snippet: Snippet): string {
  const fence = "```";
  const lang = snippet.language && snippet.language !== "plaintext" ? snippet.language : "";
  const heading = snippet.title ? `# ${snippet.title}\n\n` : "";
  return `${heading}${fence}${lang}\n${snippet.content}\n${fence}\n`;
}

export function copyPlainText(snippet: Snippet): Promise<boolean> {
  return copyToClipboard(toPlainText(snippet));
}

export function copyAsMarkdown(snippet: Snippet): Promise<boolean> {
  return copyToClipboard(toMarkdown(snippet));
}

export function copyText(text: string): Promise<boolean> {
  return copyToClipboard(text);
}
