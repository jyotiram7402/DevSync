import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" className="mx-auto flex w-full max-w-md flex-col items-center gap-6 md:pt-6">
      <span className="sr-only">Loading…</span>
      <Skeleton className="size-12 rounded-xl" />
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-56 w-full rounded-lg" />
    </div>
  );
}
