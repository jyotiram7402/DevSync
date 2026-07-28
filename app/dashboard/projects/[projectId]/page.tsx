import { notFound } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { ProjectHeader, getProjectPermissions } from "@/features/projects";
import { getProject } from "@/features/projects/services/project-service";

export const metadata = {
  title: "Project",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const result = await getProject(projectId);

  if (!result.ok) {
    if (result.error.code === "NOT_FOUND") notFound();
    return <EmptyState title="Unable to load project" description={result.error.message} />;
  }

  const { project, role } = result.data;
  const permissions = getProjectPermissions(role);

  return (
    <div className="flex flex-col gap-8">
      <ProjectHeader project={project} permissions={permissions} />
      <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
        Snippets in this project will appear here in an upcoming sprint.
      </div>
    </div>
  );
}
