import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

/**
 * SearchLoading — skeleton rows while results are loading. `rows` controls the
 * count; announced via aria-busy on the container.
 */
export function SearchLoading({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      role="status"
      aria-busy="true"
      aria-label="Loading results"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
