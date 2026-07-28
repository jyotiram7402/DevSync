import { cn } from "@/utils/cn";

/**
 * Skeleton — a pulsing placeholder block for loading states.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-secondary", className)} />;
}
