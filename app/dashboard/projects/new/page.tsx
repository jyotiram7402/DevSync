import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/features/projects";

export const metadata = {
  title: "New project",
};

/** Full-page create form (for links to /dashboard/projects/new; the app itself uses the dialog). */
export default function NewProjectPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <PageHeader
        title="New project"
        description="Group snippets by what you're working on. You can change all of this later."
      />
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <ProjectForm mode="create" cancelHref="/dashboard/projects" />
      </div>
    </div>
  );
}
