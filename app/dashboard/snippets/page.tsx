import { Plus } from "lucide-react";
import Link from "next/link";

import { ArrivalFeed } from "@/components/items/arrival-feed";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { LiveRefresh } from "@/features/dashboard/components/live-refresh";
import {
  BulkActionBar,
  SnippetEmptyState,
  SnippetFilters,
  SnippetPagination,
  SnippetSearch,
  SnippetSort,
  getSnippetPermissions,
} from "@/features/snippets";
import { SnippetRow } from "@/features/snippets/components/snippet-row";
import { snippetListParamsSchema } from "@/features/snippets/schemas";
import { listSnippets } from "@/features/snippets/services/snippet-service";
import { cn } from "@/utils/cn";

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
  const view = sp.view === "grid" ? "grid" : "list";

  const result = await listSnippets(params);

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Snippets" />
        <ErrorState title="Couldn't load your snippets" description={result.error.message}>
          <Button asChild variant="outline">
            <Link href="/dashboard/snippets">Try again</Link>
          </Button>
        </ErrorState>
      </div>
    );
  }

  const { snippets, page, totalPages, role, workspaceId } = result.data;
  const permissions = getSnippetPermissions(role);
  const filtered =
    Boolean(params.search) ||
    params.status === "archived" ||
    Boolean(params.projectId) ||
    Boolean(params.language);
  // A new search, filter, sort or page is a fresh list, not "new arrivals".
  const listKey = JSON.stringify([params.search, params.status, params.sort, params.projectId, params.language, page]);

  return (
    <div className="flex flex-col gap-5">
      {/* Saves from your other devices appear here without a reload. */}
      <LiveRefresh workspaceId={workspaceId} />

      <PageHeader
        title="Snippets"
        description="Text, code, commands and errors you save. They show up on all your devices."
        actions={
          permissions.canCreate ? (
            <Button asChild size="sm">
              <Link href="/dashboard/snippets/new">
                <Plus aria-hidden="true" />
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
      ) : (
        <ArrivalFeed
          label="Snippets"
          resetKey={listKey}
          className={cn(view === "grid" && "md:grid md:grid-cols-2 md:gap-3")}
          entries={snippets.map((snippet) => ({
            id: snippet.id,
            node: <SnippetRow snippet={snippet} permissions={permissions} />,
          }))}
        />
      )}

      <SnippetPagination page={page} totalPages={totalPages} />
      <BulkActionBar permissions={permissions} />
    </div>
  );
}
