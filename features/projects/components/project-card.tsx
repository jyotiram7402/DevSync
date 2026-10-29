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
 * Project card for the grid. The name is a stretched link, so the whole card
 * opens the project; the actions menu sits above that link and is always
 * visible.
 */
export function ProjectCard({ project, permissions }: { project: Project; permissions: ProjectPermissions }) {
  const Icon = getProjectIcon(project.icon);

  return (
    <article className="relative flex h-full min-w-0 flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors duration-fast hover:border-input/60">
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", getProjectColorSurface(project.color))}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="relative z-10 -mr-2 -mt-2 flex items-center">
          {project.pinned ? (
            <Pin className="mr-1 size-3.5 fill-current text-muted-foreground" aria-label="Pinned" />
          ) : null}
          <ProjectMenu project={project} permissions={permissions} />
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-sm font-medium text-foreground">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
          >
            {project.name}
          </Link>
        </h3>
        {project.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground [overflow-wrap:anywhere]">
            {project.description}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {project.archived ? <Badge variant="muted">Archived</Badge> : null}
        {project.favorite ? <Star className="size-3.5 fill-current text-favorite" aria-label="Favorite" /> : null}
        <span>
          Updated <RelativeTime value={project.updatedAt} />
        </span>
      </div>
    </article>
  );
}
