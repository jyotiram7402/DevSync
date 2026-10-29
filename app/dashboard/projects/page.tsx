import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  CreateProjectButton,
  PROJECTS_PURPOSE,
  ProjectEmptyState,
  ProjectFilters,
  ProjectGrid,
  ProjectList,
  ProjectPagination,
  ProjectSearch,
  ProjectSort,
  getProjectPermissions,
  parseProjectView,
} from "@/features/projects";
import { projectListParamsSchema } from "@/features/projects/schemas";
import { listProjects } from "@/features/projects/services/project-service";

export const metadata = {
  title: "Projects",
};

type SearchParams = Record<string, string | string[] | undefined>;

function stringParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const parsed = projectListParamsSchema.safeParse({
    search: stringParam(sp.search),
    status: stringParam(sp.status),
    sort: stringParam(sp.sort),
    page: stringParam(sp.page),
  });
  const params = parsed.success ? parsed.data : {};
  const view = parseProjectView(stringParam(sp.view));

  const result = await listProjects(params);

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Projects" description={PROJECTS_PURPOSE} />
        <ErrorState title="Couldn't load your projects" description={result.error.message}>
          <Button asChild variant="outline">
            <Link href="/dashboard/projects">Try again</Link>
          </Button>
        </ErrorState>
      </div>
    );
  }

  const { projects, page, totalPages, total, role } = result.data;
  const permissions = getProjectPermissions(role);
  const archived = params.status === "archived";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Projects"
        description={PROJECTS_PURPOSE}
        actions={<CreateProjectButton canCreate={permissions.canCreate} />}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ProjectSearch />
        <div className="flex flex-wrap items-center gap-2">
          <ProjectSort />
          <ProjectFilters />
        </div>
      </div>

      {projects.length === 0 && page > 1 && total > 0 ? (
        // A page past the end (an old link, or the last item on it was deleted).
        <EmptyState
          title="Nothing on this page"
          description={`There ${total === 1 ? "is 1 project" : `are ${total} projects`}, all on earlier pages.`}
          action={
            <Button asChild variant="outline">
              <Link href={archived ? "/dashboard/projects?status=archived" : "/dashboard/projects"}>
                Go to the first page
              </Link>
            </Button>
          }
        />
      ) : projects.length === 0 ? (
        <ProjectEmptyState search={params.search} archived={archived} canCreate={permissions.canCreate} />
      ) : view === "list" ? (
        <ProjectList projects={projects} permissions={permissions} />
      ) : (
        <ProjectGrid projects={projects} permissions={permissions} />
      )}

      <ProjectPagination page={page} totalPages={totalPages} />
    </div>
  );
}
