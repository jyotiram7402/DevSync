import { Plus } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  BulkActionBar,
  SnippetEmptyState,
  SnippetFilters,
  SnippetGrid,
  SnippetPagination,
  SnippetSearch,
  SnippetSort,
  SnippetTable,
  getSnippetPermissions,
} from "@/features/snippets";
import { snippetListParamsSchema } from "@/features/snippets/schemas";
import { listSnippets } from "@/features/snippets/services/snippet-service";

export const metadata = {
  title: "Snippets",
};

type SearchParams = Record<string, string | string[] | undefined>;

function stringParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function SnippetsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const parsed = snippetListParamsSchema.safeParse({
    search: stringParam(sp.search),
    status: stringParam(sp.status),
    sort: stringParam(sp.sort),
    projectId: stringParam(sp.projectId),
    language: stringParam(sp.language),
    page: stringParam(sp.page),
  });
  const params = parsed.success ? parsed.data : {};
  const view = sp.view === "table" ? "table" : "grid";

  const result = await listSnippets(params);

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Snippets" />
        <EmptyState title="Unable to load snippets" description={result.error.message} />
      </div>
    );
  }

  const { snippets, page, totalPages, role } = result.data;
  const permissions = getSnippetPermissions(role);
  const filtered =
    Boolean(params.search) ||
    params.status === "archived" ||
    Boolean(params.projectId) ||
    Boolean(params.language);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Snippets"
        description="Everything you copy, synced across your devices."
        actions={
          permissions.canCreate ? (
            <Button asChild size="sm">
              <Link href="/dashboard/snippets/new">
                <Plus />
                New snippet
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SnippetSearch />
        <div className="flex flex-wrap items-center gap-2">
          <SnippetSort />
          <SnippetFilters />
        </div>
      </div>

      {snippets.length === 0 ? (
        <SnippetEmptyState filtered={filtered} canCreate={permissions.canCreate} />
      ) : view === "table" ? (
        <SnippetTable snippets={snippets} permissions={permissions} />
      ) : (
        <SnippetGrid snippets={snippets} permissions={permissions} />
      )}

      <SnippetPagination page={page} totalPages={totalPages} />
      <BulkActionBar permissions={permissions} />
    </div>
  );
}
