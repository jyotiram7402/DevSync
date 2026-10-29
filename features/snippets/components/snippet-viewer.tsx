"use client";

import { CodeBlock } from "@/components/ui/code-block";
import { getLanguageLabel } from "@/features/snippets/languages";

/**
 * Read-only view of a snippet: the raw text in a code block (wrap toggle,
 * long content clamped, copy). Light and instant on every device; the Monaco
 * editor is only loaded when editing. Rendered as text, never executed.
 */
export function SnippetViewer({ content, language }: { content: string; language: string | null }) {
  const label = language && language !== "plaintext" ? getLanguageLabel(language) : "Text";
  return <CodeBlock value={content} label={label} maxLines={30} />;
}
