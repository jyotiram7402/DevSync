import { CircleAlert, RotateCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

/**
 * ErrorState — a list or screen that failed to load. Say what happened and
 * how to fix it (no apologies), and offer Try again when `onRetry` is given.
 * Uses an onClick handler, so render it from client components.
 */
interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** The retry is running. */
  pending?: boolean;
  /** Extra actions, e.g. a link home. */
  children?: ReactNode;
  className?: string;
}

export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  pending = false,
  children,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
        <CircleAlert className="size-6" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {onRetry || children ? (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry} loading={pending}>
              {pending ? null : <RotateCw aria-hidden="true" />}
              {retryLabel}
            </Button>
          ) : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}
