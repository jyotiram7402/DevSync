import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder matching the project grid layout. */
export function ProjectsLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
          <Skeleton className="size-10 rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
