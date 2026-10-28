"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

/**
 * Error boundary inside the app: the page area shows the error while the
 * sidebar, top bar and tab bar stay, so you can try again or go elsewhere.
 * Only the error's id is logged, never its message.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Page error", error.digest ?? error.name);
  }, [error]);

  return (
    <ErrorState
      title="This page didn't load"
      description="Something went wrong on our side. Try again, or go back to Home."
      onRetry={reset}
      className="my-6"
    >
      <Button asChild variant="ghost">
        <Link href="/dashboard/home">Go to Home</Link>
      </Button>
    </ErrorState>
  );
}
