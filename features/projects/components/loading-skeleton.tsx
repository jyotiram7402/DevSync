import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder shaped like the project grid. */
export function ProjectsLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" className="flex flex-col gap-5">
      <span className="sr-only">Loading projects…</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:max-w-xs pointer-coarse:h-11" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 pointer-coarse:h-11" />
          <Skeleton className="h-10 w-28 pointer-coarse:h-11" />
          <Skeleton className="h-10 w-20 pointer-coarse:h-11" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <Skeleton className="size-10" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Loading placeholder shaped like a project page: header, then snippet rows. */
export function ProjectDetailSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Loading the project…</span>
      <div className="flex items-start gap-4">
        <Skeleton className="size-12 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-48 md:h-8" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-9 w-20 shrink-0 pointer-coarse:h-11" />
      </div>
      <Skeleton className="h-4 w-40" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** Loading placeholder shaped like the project form page. */
export function ProjectFormSkeleton() {
  return (
    <div role="status" className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <span className="sr-only">Loading…</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40 md:h-8" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-4 sm:p-6">
        <Skeleton className="h-10 w-full pointer-coarse:h-11" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="ml-auto h-9 w-32 pointer-coarse:h-11" />
      </div>
    </div>
  );
}
