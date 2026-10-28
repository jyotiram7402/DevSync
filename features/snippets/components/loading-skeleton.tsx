import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder shaped like the Snippets feed (rows), so nothing jumps when it loads. */
export function SnippetsLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading snippets" className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-5 rounded-sm" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-14 w-full" />
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
