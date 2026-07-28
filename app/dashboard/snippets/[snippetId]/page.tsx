import { notFound } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import {
  SnippetHeader,
  SnippetToolbar,
  SnippetViewer,
  getSnippetPermissions,
} from "@/features/snippets";
import { getSnippet } from "@/features/snippets/services/snippet-service";

export const metadata = {
  title: "Snippet",
};

export default async function SnippetDetailPage({
  params,
}: {
  params: Promise<{ snippetId: string }>;
}) {
  const { snippetId } = await params;
  const result = await getSnippet(snippetId);

  if (!result.ok) {
    if (result.error.code === "NOT_FOUND") notFound();
    return <EmptyState title="Unable to load snippet" description={result.error.message} />;
  }

  const { snippet, role } = result.data;
  const permissions = getSnippetPermissions(role);

  return (
    <div className="flex flex-col gap-6">
      <SnippetHeader snippet={snippet} permissions={permissions} />
      <SnippetToolbar snippet={snippet} />
      <SnippetViewer content={snippet.content} language={snippet.language} />
    </div>
  );
}
