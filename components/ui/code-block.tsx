"use client";

import { ChevronDown, ChevronUp, WrapText } from "lucide-react";
import { useMemo, useState } from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { IconButton } from "@/components/ui/icon-button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/utils/cn";

/**
 * CodeBlock — code, commands, logs and errors, shown exactly as saved.
 *
 * Monospace with whitespace preserved. Long lines scroll inside the block
 * (never the page) or wrap: wrapping is on by default on phones (pure CSS, so
 * no flash) and the toggle overrides it. Blocks longer than `maxLines` are
 * clamped with "Show all N lines". Copy copies the raw value and the block
 * gets the "Copied" wash.
 */
interface CodeBlockProps {
  value: string;
  /** What this is, e.g. "Error log": the caption and the copy button's context. */
  label?: string;
  maxLines?: number;
  showCopy?: boolean;
  className?: string;
}

// Matches `leading-5` and `py-2.5` on the <pre>.
const LINE_HEIGHT_REM = 1.25;
const VERTICAL_PADDING_REM = 1.25;

function countLines(text: string): number {
  if (text.length === 0) return 1;
  return text.replace(/\r?\n$/, "").split(/\r?\n/).length;
}

export function CodeBlock({ value, label = "Code", maxLines = 10, showCopy = true, className }: CodeBlockProps) {
  const isPhone = useMediaQuery("(max-width: 767px)");
  const [wrapChoice, setWrapChoice] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [copies, setCopies] = useState(0);
  const lines = useMemo(() => countLines(value), [value]);

  const wrap = wrapChoice ?? isPhone;
  const clampable = lines > maxLines;
  const clamped = clampable && !expanded;

  return (
    <figure className={cn("min-w-0 overflow-hidden rounded-lg border border-border bg-muted", className)}>
      <figcaption className="flex items-center justify-between gap-2 border-b border-border py-1 pl-3 pr-1">
        <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
        <span className="flex shrink-0 items-center gap-1">
          <IconButton
            label="Wrap lines"
            icon={WrapText}
            size="sm"
            aria-pressed={wrap}
            onClick={() => setWrapChoice(!wrap)}
            className={cn(wrap && "text-primary-ink")}
          />
          {showCopy ? (
            <CopyButton
              value={value}
              iconOnly
              variant="ghost"
              srContext={label.toLowerCase()}
              onCopied={() => setCopies((count) => count + 1)}
            />
          ) : null}
        </span>
      </figcaption>

      <div className="relative">
        <pre
          key={copies}
          tabIndex={0}
          className={cn(
            "overflow-x-auto px-3 py-2.5 font-mono text-sm leading-5 text-foreground",
            wrapChoice === null
              ? "whitespace-pre-wrap [overflow-wrap:anywhere] md:whitespace-pre md:[overflow-wrap:normal]"
              : wrap
                ? "whitespace-pre-wrap [overflow-wrap:anywhere]"
                : "whitespace-pre",
            clamped && "overflow-y-hidden",
            copies > 0 && "animate-wash",
          )}
          style={clamped ? { maxHeight: `${maxLines * LINE_HEIGHT_REM + VERTICAL_PADDING_REM}rem` } : undefined}
        >
          <code>{value}</code>
        </pre>
        {clamped ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-muted"
          />
        ) : null}
      </div>

      {clampable ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border py-2 text-sm font-medium text-primary-ink transition-colors duration-fast hover:bg-accent active:bg-accent pointer-coarse:py-3"
        >
          {expanded ? (
            <ChevronUp className="size-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4" aria-hidden="true" />
          )}
          {expanded ? "Show less" : `Show all ${lines} lines`}
        </button>
      ) : null}
    </figure>
  );
}
