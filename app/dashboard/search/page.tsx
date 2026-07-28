import { PageHeader } from "@/components/shared/page-header";
import { SearchWorkspace } from "@/features/search/components/search-workspace";
import type { TabValue } from "@/features/search/hooks/use-search";
import { parseSearchParams } from "@/features/search/schemas";
import { getFilterOptions } from "@/features/search/services/search-service";

export const metadata = {
  title: "Search",
};

type SearchParamsInput = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const sp = await searchParams;
  const parsed = parseSearchParams({
    query: firstValue(sp.query),
    types: sp.types,
    sort: firstValue(sp.sort),
    page: firstValue(sp.page),
    projectId: firstValue(sp.projectId),
    collectionId: firstValue(sp.collectionId),
    language: firstValue(sp.language),
    tag: firstValue(sp.tag),
    createdBy: firstValue(sp.createdBy),
    updatedBy: firstValue(sp.updatedBy),
    createdAfter: firstValue(sp.createdAfter),
    createdBefore: firstValue(sp.createdBefore),
    updatedAfter: firstValue(sp.updatedAfter),
    updatedBefore: firstValue(sp.updatedBefore),
    favorite: firstValue(sp.favorite),
    pinned: firstValue(sp.pinned),
    archived: firstValue(sp.archived),
    visibility: firstValue(sp.visibility),
  });

  const initialType: TabValue =
    parsed.types.length === 1 && parsed.types[0] ? parsed.types[0] : "all";
  const optionsResult = await getFilterOptions();
  const options = optionsResult.ok ? optionsResult.data : { projects: [], collections: [] };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Search" description="Find anything across your workspace." />
      <SearchWorkspace
        initialQuery={parsed.query}
        initialType={initialType}
        initialSort={parsed.sort}
        initialFilters={parsed.filters}
        projectOptions={options.projects}
        collectionOptions={options.collections}
      />
    </div>
  );
}
