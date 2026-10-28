import { PageHeader } from "@/components/shared/page-header";
import { SnippetsLoadingSkeleton } from "@/features/snippets";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Snippets"
        description="Text, code, commands and errors you save. They show up on all your devices."
      />
      <SnippetsLoadingSkeleton />
    </div>
  );
}
