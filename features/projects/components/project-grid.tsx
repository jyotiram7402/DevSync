import { ProjectCard } from "@/features/projects/components/project-card";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";

/** Responsive grid of project cards. */
export function ProjectGrid({
  projects,
  permissions,
}: {
  projects: Project[];
  permissions: ProjectPermissions;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} permissions={permissions} />
      ))}
    </div>
  );
}
