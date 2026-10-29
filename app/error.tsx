"use client";

import { RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

/**
 * Error boundary for pages outside the app (landing, sign-in, legal). Says
 * what happened, offers Try again and a way home. Only the error's id is
 * logged, never its message (it could contain what was being saved).
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
    console.error("Page error", error.digest ?? error.name);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <Logo />
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          This page didn&apos;t load. Try again; if it keeps happening, come back in a few minutes.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" onClick={reset}>
          <RotateCw aria-hidden="true" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
    </main>
  );
}
