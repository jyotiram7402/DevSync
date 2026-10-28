import { ProjectCard } from "@/features/projects/components/project-card";
import type { ProjectPermissions } from "@/features/projects/permissions";
import type { Project } from "@/features/projects/types";

/** Project cards: one column on phones, two from sm, three from lg. */
export function ProjectGrid({ projects, permissions }: { projects: Project[]; permissions: ProjectPermissions }) {
  return (
    <ul aria-label="Projects" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id} className="min-w-0">
          <ProjectCard project={project} permissions={permissions} />
        </li>
      ))}
    </ul>
  );
}
