import { Pin, Star } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ProjectMenu } from "@/features/projects/components/project-menu";
import { getProjectColorSurface } from "@/features/projects/constants";
import { getProjectIcon } from "@/features/projects/icons";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";
import { formatRelativeTime } from "@/utils/date";
import { cn } from "@/utils/cn";

/**
 * Project card (server component). The title is a stretched link that makes the
 * whole card clickable; the actions menu sits above it (relative z-10).
 */
export function ProjectCard({
  project,
  permissions,
}: {
  project: Project;
  permissions: ProjectPermissions;
}) {
  const Icon = getProjectIcon(project.icon);

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            getProjectColorSurface(project.color),
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="flex items-center gap-1">
          {project.pinned ? (
            <Pin className="size-3.5 fill-current text-muted-foreground" aria-label="Pinned" />
          ) : null}
          <ProjectMenu project={project} permissions={permissions} />
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="truncate font-medium">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {project.name}
          </Link>
        </h3>
        {project.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
        ) : null}
      </div>

      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        {project.archived ? <Badge variant="muted">Archived</Badge> : null}
        {project.favorite ? (
          <Star className="size-3.5 fill-current text-amber-500" aria-label="Favorite" />
        ) : null}
        <span className="truncate">Updated {formatRelativeTime(project.updatedAt)}</span>
      </div>
    </div>
  );
}
