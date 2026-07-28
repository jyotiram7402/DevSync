import { PageHeader } from "@/components/shared/page-header";
import { SnippetsLoadingSkeleton } from "@/features/snippets";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Snippets" description="Everything you copy, synced across your devices." />
      <SnippetsLoadingSkeleton />
    </div>
  );
}
