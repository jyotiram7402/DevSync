"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/dialog";
import { announce } from "@/utils/announce";
import { copyTextFrom, copyToClipboard } from "@/utils/clipboard";
import { cn } from "@/utils/cn";

/**
 * CopyButton — the one copy action.
 *
 * Copies the raw value exactly (no trimming, no markup). On success the icon
 * turns into a check for 1.5s ("Copy" → "Copied") and screen readers hear
 * "Copied". `value` can be a function returning a Promise for values that must
 * be fetched first (e.g. a fresh signed URL): the clipboard write still starts
 * inside the tap, as Safari requires. If the browser blocks the clipboard, a
 * sheet opens with the text selected so it can be copied by hand.
 */
export type CopyValue = string | (() => Promise<string>);

export interface CopyButtonProps
  extends Omit<ButtonProps, "value" | "children" | "asChild" | "onClick" | "loading"> {
  value: CopyValue;
  /** Visible text before copying. */
  label?: string;
  /** Visible text after copying. */
  copiedLabel?: string;
  /** What gets copied, for screen readers: "error log" → "Copy error log". */
  srContext?: string;
  iconOnly?: boolean;
  onCopied?: () => void;
}

const RESET_AFTER_MS = 1500;

function lineCount(text: string): number {
  return text.split(/\r?\n/).length;
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  srContext,
  iconOnly = false,
  onCopied,
  variant = "outline",
  size,
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [manualText, setManualText] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function handleClick() {
    let ok: boolean;
    try {
      // Both helpers start the clipboard write synchronously, inside the tap.
      ok = typeof value === "string" ? await copyToClipboard(value) : await copyTextFrom(value);
    } catch {
      ok = false;
    }

    if (ok) {
      setCopied(true);
      announce(copiedLabel);
      onCopied?.();
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), RESET_AFTER_MS);
      return;
    }

    // The browser blocked the clipboard: offer the text to copy by hand.
    try {
      setManualText(typeof value === "string" ? value : await value());
    } catch {
      toast.error("Couldn't load the text to copy. Check your connection and try again.");
    }
  }

  const visibleLabel = copied ? copiedLabel : label;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size ?? (iconOnly ? "icon-sm" : "sm")}
        onClick={handleClick}
        aria-label={iconOnly ? (srContext ? `${visibleLabel} ${srContext}` : visibleLabel) : undefined}
        className={cn(copied && "text-primary-ink", className)}
        {...props}
      >
        {copied ? <Check className="animate-pop" aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {iconOnly ? null : (
          <span>
            {visibleLabel}
            {srContext ? <span className="sr-only"> {srContext}</span> : null}
          </span>
        )}
      </Button>

      <ResponsiveDialog
        open={manualText !== null}
        onClose={() => setManualText(null)}
        title="Copy this text"
        description="Your browser blocked automatic copying."
      >
        <p className="text-sm text-muted-foreground">
          <span className="pointer-coarse:hidden">Select the text and press Ctrl+C (⌘C on a Mac).</span>
          <span className="hidden pointer-coarse:inline">Long-press the text, then tap Copy.</span>
        </p>
        <textarea
          readOnly
          value={manualText ?? ""}
          rows={Math.min(10, Math.max(3, lineCount(manualText ?? "")))}
          aria-label="Text to copy"
          data-autofocus=""
          onFocus={(event) => event.currentTarget.select()}
          className="w-full resize-none rounded-md border border-input bg-muted p-3 font-mono text-sm text-foreground"
        />
      </ResponsiveDialog>
    </>
  );
}
