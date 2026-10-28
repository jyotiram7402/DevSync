import { Archive, FolderKanban, SearchX } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CreateProjectButton } from "@/features/projects/components/create-project-button";

/**
 * What the projects list says when it's empty: no matches for a search (with
 * a way to clear it), no archived projects, or no projects yet (with the same
 * create dialog as the page header).
 */
export function ProjectEmptyState({
  search,
  archived,
  canCreate,
}: {
  search: string | undefined;
  archived: boolean;
  canCreate: boolean;
}) {
  if (search) {
    return (
      <EmptyState
        icon={SearchX}
        title="No projects match"
        description={`Nothing ${archived ? "archived " : ""}matches "${search}". Check the spelling, or try a shorter word.`}
        action={
          <Button asChild variant="outline">
            <Link href={archived ? "/dashboard/projects?status=archived" : "/dashboard/projects"}>Clear search</Link>
          </Button>
        }
      />
    );
  }

  if (archived) {
    return (
      <EmptyState
        icon={Archive}
        title="No archived projects"
        description="Projects you archive show up here. Archiving hides a project without deleting it."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/projects">Show active projects</Link>
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={FolderKanban}
      title="No projects yet"
      description="Make a project for each thing you work on, then file snippets into it from the snippet editor."
      action={<CreateProjectButton canCreate={canCreate} />}
    />
  );
}
