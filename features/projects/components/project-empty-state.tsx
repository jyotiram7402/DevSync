import { FolderKanban, Plus } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Empty state for the projects list. Differentiates "no matches for filters"
 * from "no projects yet" and offers a create action when permitted.
 */
export function ProjectEmptyState({
  filtered,
  canCreate,
}: {
  filtered: boolean;
  canCreate: boolean;
}) {
  if (filtered) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects found"
        description="No projects match your current search and filters. Try adjusting them."
      />
    );
  }

  return (
    <EmptyState
      icon={FolderKanban}
      title="No projects yet"
      description="Create your first project to start organizing your snippets."
      action={
        canCreate ? (
          <Button asChild size="sm">
            <Link href="/dashboard/projects/new">
              <Plus />
              New project
            </Link>
          </Button>
        ) : null
      }
    />
  );
}
