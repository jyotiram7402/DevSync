import { PageHeader } from "@/components/shared/page-header";
import { PROJECTS_PURPOSE, ProjectsLoadingSkeleton } from "@/features/projects";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Projects" description={PROJECTS_PURPOSE} />
      <ProjectsLoadingSkeleton />
    </div>
  );
}
