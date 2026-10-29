import Link from "next/link";
import { notFound } from "next/navigation";

import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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
  const detailHref = `/dashboard/projects/${projectId}`;

  if (!result.ok) {
    if (result.error.code === "NOT_FOUND") notFound();
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <PageHeader title="Edit project" />
        <ErrorState title="Couldn't load this project" description={result.error.message}>
          <Button asChild variant="outline">
            <Link href={`${detailHref}/edit`}>Try again</Link>
          </Button>
        </ErrorState>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <PageHeader title="Edit project" description={result.data.project.name} />
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <ProjectForm mode="edit" project={result.data.project} cancelHref={detailHref} />
      </div>
    </div>
  );
}
