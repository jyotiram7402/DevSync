import { Pin, Star } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ProjectMenu } from "@/features/projects/components/project-menu";
import { getProjectColorSurface } from "@/features/projects/constants";
import { getProjectIcon } from "@/features/projects/icons";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";
import { cn } from "@/utils/cn";
import { formatRelativeTime } from "@/utils/date";

/** Tabular project layout. Horizontally scrolls on narrow screens. */
export function ProjectTable({
  projects,
  permissions,
}: {
  projects: Project[];
  permissions: ProjectPermissions;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[36rem] text-sm">
        <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Name
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Updated
            </th>
            <th scope="col" className="px-4 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {projects.map((project) => {
            const Icon = getProjectIcon(project.icon);
            return (
              <tr key={project.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md",
                        getProjectColorSurface(project.color),
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="rounded-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {project.name}
                      </Link>
                      {project.pinned ? (
                        <Pin className="size-3 fill-current text-muted-foreground" aria-label="Pinned" />
                      ) : null}
                      {project.favorite ? (
                        <Star className="size-3 fill-current text-amber-500" aria-label="Favorite" />
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={project.archived ? "muted" : "outline"}>
                    {project.archived ? "Archived" : "Active"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatRelativeTime(project.updatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <ProjectMenu project={project} permissions={permissions} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
