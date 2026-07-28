import { PageHeader } from "@/components/shared/page-header";
import { ProjectsLoadingSkeleton } from "@/features/projects";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Projects" description="Organize your snippets into projects." />
      <ProjectsLoadingSkeleton />
    </div>
  );
}
