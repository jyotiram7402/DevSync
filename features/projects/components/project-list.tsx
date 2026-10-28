import { Pin, Star } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { RelativeTime } from "@/components/ui/relative-time";
import { ProjectMenu } from "@/features/projects/components/project-menu";
import { getProjectColorSurface } from "@/features/projects/constants";
import { getProjectIcon } from "@/features/projects/icons";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";
import { cn } from "@/utils/cn";

/**
 * Dense list of projects (the "List" view). The same rows on every screen:
 * on phones the updated time sits under the name; from sm it gets its own
 * column. Each row opens its project; the menu is always visible.
 */
export function ProjectList({ projects, permissions }: { projects: Project[]; permissions: ProjectPermissions }) {
  return (
    <ul aria-label="Projects" className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
      {projects.map((project) => {
        const Icon = getProjectIcon(project.icon);
        return (
          <li
            key={project.id}
            className="relative flex min-h-16 min-w-0 items-center gap-3 px-3 py-2 transition-colors duration-fast first:rounded-t-lg last:rounded-b-lg hover:bg-accent/60 sm:px-4"
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md",
                getProjectColorSurface(project.color),
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="truncate text-sm font-medium text-foreground outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
                >
                  {project.name}
                </Link>
                {project.pinned ? (
                  <Pin className="size-3.5 shrink-0 fill-current text-muted-foreground" aria-label="Pinned" />
                ) : null}
                {project.favorite ? (
                  <Star className="size-3.5 shrink-0 fill-current text-favorite" aria-label="Favorite" />
                ) : null}
                {project.archived ? (
                  <Badge variant="muted" className="shrink-0">
                    Archived
                  </Badge>
                ) : null}
              </div>
              {project.description ? (
                <p className="truncate text-xs text-muted-foreground">{project.description}</p>
              ) : null}
              <p className="text-xs text-muted-foreground sm:hidden">
                Updated <RelativeTime value={project.updatedAt} />
              </p>
            </div>

            <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
              Updated <RelativeTime value={project.updatedAt} />
            </span>

            <div className="relative z-10 -mr-1 shrink-0">
              <ProjectMenu project={project} permissions={permissions} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
