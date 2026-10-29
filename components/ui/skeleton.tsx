import { cn } from "@/utils/cn";

/**
 * Skeleton — a softly pulsing placeholder block. Shape it like the content it
 * stands in for (same height, width and radius) so nothing shifts on load.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
