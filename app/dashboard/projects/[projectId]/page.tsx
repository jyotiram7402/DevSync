import { Code2, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbLabel } from "@/components/dashboard/breadcrumb-label";
import { ArrivalFeed } from "@/components/items/arrival-feed";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { ProjectHeader, getProjectPermissions } from "@/features/projects";
import { getProject } from "@/features/projects/services/project-service";
import { BulkActionBar, SnippetPagination, getSnippetPermissions } from "@/features/snippets";
import { SnippetRow } from "@/features/snippets/components/snippet-row";
import { listSnippets } from "@/features/snippets/services/snippet-service";
import type { SnippetListResult } from "@/features/snippets/types";

export const metadata = {
  title: "Project",
};

type SearchParams = Record<string, string | string[] | undefined>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function pageParam(value: string | string[] | undefined): number {
  const page = typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(page) && page > 1 ? page : 1;
}

/**
 * A project and its snippets (most recently changed first), from the shared
 * item family, with the same selection and bulk actions as Snippets.
 */
export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ projectId }, sp] = await Promise.all([params, searchParams]);
  if (!UUID.test(projectId)) notFound();
  const page = pageParam(sp.page);
  const projectHref = `/dashboard/projects/${projectId}`;

  const [projectResult, snippetsResult] = await Promise.all([
    getProject(projectId),
    listSnippets({ projectId, page }),
  ]);

  if (!projectResult.ok) {
    if (projectResult.error.code === "NOT_FOUND") notFound();
    return (
      <ErrorState title="Couldn't load this project" description={projectResult.error.message}>
        <Button asChild variant="outline">
          <Link href={projectHref}>Try again</Link>
        </Button>
      </ErrorState>
    );
  }

  const { project, role } = projectResult.data;
  const permissions = getProjectPermissions(role);

  return (
    <div className="flex flex-col gap-6">
      <BreadcrumbLabel label={project.name} />
      <ProjectHeader project={project} permissions={permissions} />

      {!snippetsResult.ok ? (
        <ErrorState title="Couldn't load this project's snippets" description={snippetsResult.error.message}>
          <Button asChild variant="outline">
            <Link href={projectHref}>Try again</Link>
          </Button>
        </ErrorState>
      ) : (
        <ProjectSnippets result={snippetsResult.data} projectHref={projectHref} />
      )}
    </div>
  );
}

function ProjectSnippets({ result, projectHref }: { result: SnippetListResult; projectHref: string }) {
  const { snippets, total, page, totalPages, role } = result;
  const permissions = getSnippetPermissions(role);

  if (snippets.length === 0) {
    if (page > 1 && total > 0) {
      return (
        <EmptyState
          title="Nothing on this page"
          description="This project's snippets are all on earlier pages."
          action={
            <Button asChild variant="outline">
              <Link href={projectHref}>Go to the first page</Link>
            </Button>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={Code2}
        title="No snippets in this project yet"
        description="When you create or edit a snippet, choose this project to file it here."
        action={
          permissions.canCreate ? (
            <Button asChild>
              <Link href="/dashboard/snippets/new">
                <Plus aria-hidden="true" />
                New snippet
              </Link>
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <section aria-labelledby="project-snippets" className="flex flex-col gap-3">
      <h2 id="project-snippets" className="text-sm font-medium text-muted-foreground">
        {total === 1 ? "1 snippet" : `${total} snippets`}
      </h2>

      <ArrivalFeed
        label="Snippets in this project"
        resetKey={`${projectHref}:${page}`}
        entries={snippets.map((snippet) => ({
          id: snippet.id,
          node: <SnippetRow snippet={snippet} permissions={permissions} />,
        }))}
      />

      <SnippetPagination page={page} totalPages={totalPages} />
      <BulkActionBar permissions={permissions} />
    </section>
  );
}
