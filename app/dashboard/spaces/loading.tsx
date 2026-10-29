import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Spaces"
        description="Rooms for a project. Share an error, code or a file in a room and everyone in it sees it right away."
      />
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">Loading your rooms…</span>
        <Skeleton className="h-4 w-28" />
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg sm:h-[4.5rem]" />
        ))}
      </div>
    </div>
  );
}
