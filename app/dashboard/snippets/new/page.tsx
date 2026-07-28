import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SnippetForm } from "@/features/snippets";
import { getSnippetFormOptions } from "@/features/snippets/services/snippet-service";

export const metadata = {
  title: "New snippet",
};

export default async function NewSnippetPage() {
  const options = await getSnippetFormOptions();

  if (!options.ok) {
    return <EmptyState title="Unable to load the form" description={options.error.message} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title="New snippet" description="Capture a snippet to sync across your devices." />
      <div className="rounded-xl border bg-card p-6">
        <SnippetForm
          mode="create"
          projectOptions={options.data.projects}
          collectionOptions={options.data.collections}
        />
      </div>
    </div>
  );
}
