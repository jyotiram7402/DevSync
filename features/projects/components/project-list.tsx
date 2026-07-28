import { ProjectCard } from "@/features/projects/components/project-card";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";

/** Single-column stack of project cards (compact/list layout). */
export function ProjectList({
  projects,
  permissions,
}: {
  projects: Project[];
  permissions: ProjectPermissions;
}) {
  return (
    <div className="flex flex-col gap-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} permissions={permissions} />
      ))}
    </div>
  );
}
