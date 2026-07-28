import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  CreateProjectButton,
  ProjectEmptyState,
  ProjectFilters,
  ProjectGrid,
  ProjectPagination,
  ProjectSearch,
  ProjectSort,
  ProjectTable,
  getProjectPermissions,
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
  const view = sp.view === "table" ? "table" : "grid";

  const result = await listProjects(params);

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Projects" />
        <EmptyState title="Unable to load projects" description={result.error.message} />
      </div>
    );
  }

  const { projects, page, totalPages, role } = result.data;
  const permissions = getProjectPermissions(role);
  const filtered = Boolean(params.search) || params.status === "archived";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Projects"
        description="Organize your snippets into projects."
        actions={<CreateProjectButton canCreate={permissions.canCreate} />}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ProjectSearch />
        <div className="flex items-center gap-2">
          <ProjectSort />
          <ProjectFilters />
        </div>
      </div>

      {projects.length === 0 ? (
        <ProjectEmptyState filtered={filtered} canCreate={permissions.canCreate} />
      ) : view === "table" ? (
        <ProjectTable projects={projects} permissions={permissions} />
      ) : (
        <ProjectGrid projects={projects} permissions={permissions} />
      )}

      <ProjectPagination page={page} totalPages={totalPages} />
    </div>
  );
}
