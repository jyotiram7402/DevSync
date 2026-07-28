import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/features/projects";

export const metadata = {
  title: "New project",
};

export default function NewProjectPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <PageHeader title="New project" description="Create a project to organize your snippets." />
      <div className="rounded-xl border bg-card p-6">
        <ProjectForm mode="create" />
      </div>
    </div>
  );
}
