import { cn } from "@/utils/cn";

/**
 * Lightweight, dependency-free preview of snippet content (first few lines).
 * Rendered as escaped text by React — safe against XSS. Used in cards where
 * loading Monaco would be wasteful.
 */
export function SnippetPreview({
  content,
  maxLines = 5,
  className,
}: {
  content: string;
  maxLines?: number;
  className?: string;
}) {
  const preview = content.split("\n").slice(0, maxLines).join("\n");

  return (
    <pre
      className={cn(
        "overflow-hidden whitespace-pre-wrap break-words rounded-md bg-muted/50 p-3 font-mono text-xs text-muted-foreground",
        className,
      )}
    >
      {preview}
    </pre>
  );
}
