"use client";

import { CopyButton } from "@/components/ui/copy-button";
import { DownloadButton } from "@/features/snippets/components/download-button";
import { toMarkdown } from "@/features/snippets/services/clipboard-service";
import type { Snippet } from "@/features/snippets/types";

/** Copy (the raw text), copy as Markdown, and download, for the snippet page. */
export function SnippetToolbar({ snippet }: { snippet: Snippet }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton value={snippet.content} variant="default" size="default" />
      <CopyButton value={toMarkdown(snippet)} label="Copy as Markdown" size="default" />
      <DownloadButton snippet={snippet} size="default" />
    </div>
  );
}
