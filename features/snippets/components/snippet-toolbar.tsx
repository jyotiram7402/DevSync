"use client";

import { FileCode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/features/snippets/components/copy-button";
import { DownloadButton } from "@/features/snippets/components/download-button";
import { copyAsMarkdown } from "@/features/snippets/services/clipboard-service";
import type { Snippet } from "@/features/snippets/types";

/** Copy / copy-as-Markdown / download actions for the snippet viewer. */
export function SnippetToolbar({ snippet }: { snippet: Snippet }) {
  async function handleMarkdown() {
    const ok = await copyAsMarkdown(snippet);
    if (ok) toast.success("Copied as Markdown");
    else toast.error("Could not copy to clipboard.");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton snippet={snippet} />
      <Button type="button" variant="outline" size="sm" onClick={handleMarkdown}>
        <FileCode />
        Copy as Markdown
      </Button>
      <DownloadButton snippet={snippet} />
    </div>
  );
}
