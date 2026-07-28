import { Pin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProjectActions } from "@/features/projects/components/project-actions";
import { getProjectColorSurface } from "@/features/projects/constants";
import { getProjectIcon } from "@/features/projects/icons";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";
import { cn } from "@/utils/cn";

/**
 * Detail-page header: project identity (icon, name, description, status) with
 * the action cluster.
 */
export function ProjectHeader({
  project,
  permissions,
}: {
  project: Project;
  permissions: ProjectPermissions;
}) {
  const Icon = getProjectIcon(project.icon);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl",
            getProjectColorSurface(project.color),
          )}
        >
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{project.name}</h1>
            {project.pinned ? (
              <Pin className="size-4 fill-current text-muted-foreground" aria-label="Pinned" />
            ) : null}
            {project.favorite ? (
              <Star className="size-4 fill-current text-amber-500" aria-label="Favorite" />
            ) : null}
            {project.archived ? <Badge variant="muted">Archived</Badge> : null}
          </div>
          {project.description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{project.description}</p>
          ) : null}
        </div>
      </div>
      <div className="shrink-0">
        <ProjectActions project={project} permissions={permissions} />
      </div>
    </div>
  );
}
