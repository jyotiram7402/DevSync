import { cn } from "@/utils/cn";

/**
 * ItemPreview — the first few lines of an item's text, rendered as escaped
 * text (safe against XSS). Code, commands, errors and logs keep their
 * whitespace in monospace; plain text wraps as prose. Only a slice of long
 * content is rendered; the full text lives on the item page and in Copy.
 */
const MAX_PREVIEW_CHARS = 1200;

export function ItemPreview({
  text,
  code = false,
  lines = 3,
  className,
}: {
  text: string;
  code?: boolean;
  lines?: 2 | 3 | 4;
  className?: string;
}) {
  const slice = text.length > MAX_PREVIEW_CHARS ? text.slice(0, MAX_PREVIEW_CHARS) : text;
  const clamp = lines === 2 ? "line-clamp-2" : lines === 4 ? "line-clamp-4" : "line-clamp-3";

  if (code) {
    return (
      <pre
        className={cn(
          "overflow-hidden whitespace-pre-wrap rounded-md bg-muted px-3 py-2 font-mono text-xs leading-5 text-muted-foreground [overflow-wrap:anywhere]",
          clamp,
          className,
        )}
      >
        {slice}
      </pre>
    );
  }

  return (
    <p className={cn("whitespace-pre-line text-sm text-muted-foreground [overflow-wrap:anywhere]", clamp, className)}>
      {slice}
    </p>
  );
}
