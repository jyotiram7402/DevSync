import { Loader2 } from "lucide-react";

/**
 * Route-level loading UI. Rendered by Next.js as the Suspense fallback while
 * a route segment streams. Kept minimal and dependency-free.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading" />
    </div>
  );
}
