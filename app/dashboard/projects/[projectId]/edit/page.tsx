import { notFound } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/features/projects";
import { getProject } from "@/features/projects/services/project-service";

export const metadata = {
  title: "Edit project",
};

export default async function EditProjectPage({
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

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <PageHeader title="Edit project" description="Update your project details." />
      <div className="rounded-xl border bg-card p-6">
        <ProjectForm mode="edit" project={result.data.project} />
      </div>
    </div>
  );
}
