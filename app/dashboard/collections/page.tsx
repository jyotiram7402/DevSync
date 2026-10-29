import { FolderKanban, Library } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Collections",
};

/**
 * Collections can't be created in the web app yet. The page says so plainly
 * and points to Projects, which already group snippets.
 */
export default function CollectionsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Collections"
        description="A collection groups snippets from different projects, like a set of fixes you reuse."
      />
      <EmptyState
        icon={Library}
        title="Creating collections isn't available in the web app yet"
        description="For now, group snippets with Projects, and pin or favorite the ones you reach for often."
        action={
          <Button asChild>
            <Link href="/dashboard/projects">
              <FolderKanban aria-hidden="true" />
              Go to Projects
            </Link>
          </Button>
        }
      />
    </div>
  );
}
