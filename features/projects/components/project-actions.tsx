"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProjectMenu } from "@/features/projects/components/project-menu";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";

/**
 * Action cluster for the project detail header: an Edit shortcut plus the full
 * actions menu (favorite, pin, archive/restore, delete).
 */
export function ProjectActions({
  project,
  permissions,
}: {
  project: Project;
  permissions: ProjectPermissions;
}) {
  return (
    <div className="flex items-center gap-2">
      {permissions.canEdit ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Pencil />
            Edit
          </Link>
        </Button>
      ) : null}
      <ProjectMenu project={project} permissions={permissions} />
    </div>
  );
}
