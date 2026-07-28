import { notFound } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SnippetForm } from "@/features/snippets";
import { getSnippet, getSnippetFormOptions } from "@/features/snippets/services/snippet-service";

export const metadata = {
  title: "Edit snippet",
};

export default async function EditSnippetPage({
  params,
}: {
  params: Promise<{ snippetId: string }>;
}) {
  const { snippetId } = await params;
  const [result, options] = await Promise.all([getSnippet(snippetId), getSnippetFormOptions()]);

  if (!result.ok) {
    if (result.error.code === "NOT_FOUND") notFound();
    return <EmptyState title="Unable to load snippet" description={result.error.message} />;
  }
  if (!options.ok) {
    return <EmptyState title="Unable to load the form" description={options.error.message} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title="Edit snippet" description="Update your snippet." />
      <div className="rounded-xl border bg-card p-6">
        <SnippetForm
          mode="edit"
          snippet={result.data.snippet}
          projectOptions={options.data.projects}
          collectionOptions={options.data.collections}
        />
      </div>
    </div>
  );
}
