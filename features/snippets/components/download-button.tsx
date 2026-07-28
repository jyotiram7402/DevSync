"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadSnippet } from "@/features/snippets/services/export-service";
import type { Snippet } from "@/features/snippets/types";

/** Downloads the snippet as a file named from its title + language extension. */
export function DownloadButton({
  snippet,
  variant = "outline",
  size = "sm",
}: {
  snippet: Snippet;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "icon";
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => downloadSnippet(snippet)}
      aria-label="Download snippet"
    >
      <Download />
      {size !== "icon" ? "Download" : null}
    </Button>
  );
}
