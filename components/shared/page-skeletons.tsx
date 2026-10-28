import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route loading skeletons, shaped like the pages they stand in for so nothing
 * jumps when the content arrives. Each announces "Loading…" once.
 */

function Header({ actions = false }: { actions?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40 md:h-8" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      {actions ? <Skeleton className="h-9 w-32 pointer-coarse:h-11" /> : null}
    </div>
  );
}

function Rows({ count = 4, height = "h-24" }: { count?: number; height?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className={`${height} w-full rounded-lg`} />
      ))}
    </div>
  );
}

/** A list page: title, a row of filter chips, then item rows. */
export function ListPageSkeleton({ chips = true }: { chips?: boolean }) {
  return (
    <div role="status" className="flex flex-col gap-5">
      <span className="sr-only">Loading…</span>
      <Header actions />
      {chips ? (
        <div className="flex gap-2 overflow-hidden">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      ) : null}
      <Rows />
    </div>
  );
}

/** One item's page: header with actions, then the content block. */
export function DetailPageSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-5">
      <span className="sr-only">Loading…</span>
      <Header actions />
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}

/** A form page: title, then labeled fields and the save row. */
export function FormPageSkeleton() {
  return (
    <div role="status" className="flex max-w-3xl flex-col gap-5">
      <span className="sr-only">Loading…</span>
      <Header />
      {[0, 1].map((index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full pointer-coarse:h-11" />
        </div>
      ))}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-60 w-full" />
      </div>
      <Skeleton className="h-10 w-28 self-end pointer-coarse:h-11" />
    </div>
  );
}

/** Settings-style pages: titled sections. */
export function SectionsPageSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Loading…</span>
      <Header />
      {[0, 1, 2].map((index) => (
        <div key={index} className="grid gap-4 border-t border-border pt-6 first:border-t-0 first:pt-0 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
