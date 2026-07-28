"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { copyPlainText } from "@/features/snippets/services/clipboard-service";
import type { Snippet } from "@/features/snippets/types";

/** Copies the snippet's content to the clipboard with brief "Copied" feedback. */
export function CopyButton({
  snippet,
  variant = "outline",
  size = "sm",
}: {
  snippet: Snippet;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "icon";
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyPlainText(snippet);
    if (!ok) {
      toast.error("Could not copy to clipboard.");
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy snippet"}
    >
      {copied ? <Check /> : <Copy />}
      {size !== "icon" ? (copied ? "Copied" : "Copy") : null}
    </Button>
  );
}
