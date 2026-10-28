import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchLoading } from "@/features/search/components/search-loading";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Search" description="Find any snippet, project or tag by a word in it." />
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      <SearchLoading />
    </div>
  );
}
