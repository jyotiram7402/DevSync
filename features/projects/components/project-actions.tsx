"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ProjectDialog } from "@/features/projects/components/project-dialog";
import { ProjectMenu } from "@/features/projects/components/project-menu";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";

/**
 * Actions on a project's own page: Edit (in a dialog) and the menu with the
 * rest. Deleting from here goes back to the projects list.
 */
export function ProjectActions({ project, permissions }: { project: Project; permissions: ProjectPermissions }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center gap-1">
      {permissions.canEdit ? (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil aria-hidden="true" />
            Edit
          </Button>
          <ProjectDialog open={editing} onClose={() => setEditing(false)} mode="edit" project={project} />
        </>
      ) : null}
      <ProjectMenu project={project} permissions={permissions} redirectAfterDelete="/dashboard/projects" />
    </div>
  );
}
