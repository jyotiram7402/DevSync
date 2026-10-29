import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" className="flex flex-col gap-4 md:gap-5">
      <span className="sr-only">Loading the room…</span>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48 md:h-8" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Skeleton className="h-8 w-24 pointer-coarse:h-11" />
      </div>
      <Skeleton className="hidden h-[7.5rem] w-full rounded-lg md:block" />
      <Skeleton className="h-11 w-full" />
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  );
}
