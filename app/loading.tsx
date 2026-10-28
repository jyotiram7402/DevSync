import { LoadingSpinner } from "@/components/shared/loading-spinner";

/**
 * Route-level loading UI for pages outside the app (the app's own pages have
 * skeletons shaped like their content).
 */
export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <LoadingSpinner label="Loading…" />
    </div>
  );
}
