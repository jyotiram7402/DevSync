"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Segment-level error boundary. Next.js renders this when a Server or Client
 * Component in this segment throws. It keeps the failure contained and offers
 * a recovery path via `reset()`. Detailed logging/monitoring is wired in a
 * later sprint (see docs/architecture/09-Error-Handling.md).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. You can try again, and if the problem persists please contact
        support.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
