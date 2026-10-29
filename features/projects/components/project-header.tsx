import { Pin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProjectActions } from "@/features/projects/components/project-actions";
import { getProjectColorSurface } from "@/features/projects/constants";
import { getProjectIcon } from "@/features/projects/icons";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";
import { cn } from "@/utils/cn";

/**
 * Project page header: icon, name (wraps rather than overflowing), status and
 * description, with Edit and the actions menu. On phones the name gets the
 * full width under the icon and actions; from sm it sits between them.
 */
export function ProjectHeader({ project, permissions }: { project: Project; permissions: ProjectPermissions }) {
  const Icon = getProjectIcon(project.icon);

  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3 sm:gap-x-4">
      <span
        className={cn(
          "col-start-1 row-start-1 flex size-10 items-center justify-center rounded-lg sm:size-12",
          getProjectColorSurface(project.color),
        )}
      >
        <Icon className="size-5 sm:size-6" aria-hidden="true" />
      </span>

      <div className="col-span-3 col-start-1 row-start-2 flex min-w-0 flex-col gap-1 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        <h1 className="text-xl font-semibold tracking-tight [overflow-wrap:anywhere] md:text-2xl">{project.name}</h1>
        {project.pinned || project.favorite || project.archived ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {project.archived ? <Badge variant="muted">Archived</Badge> : null}
            {project.pinned ? (
              <Badge variant="outline">
                <Pin className="size-3 fill-current" aria-hidden="true" />
                Pinned
              </Badge>
            ) : null}
            {project.favorite ? (
              <Badge variant="outline">
                <Star className="size-3 fill-current text-favorite" aria-hidden="true" />
                Favorite
              </Badge>
            ) : null}
          </div>
        ) : null}
        {project.description ? (
          <p className="max-w-prose text-sm text-muted-foreground [overflow-wrap:anywhere]">{project.description}</p>
        ) : null}
      </div>

      <div className="col-start-3 row-start-1">
        <ProjectActions project={project} permissions={permissions} />
      </div>
    </header>
  );
}
