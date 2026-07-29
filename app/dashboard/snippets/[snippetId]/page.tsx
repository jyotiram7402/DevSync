import { notFound } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import {
  SnippetHeader,
  SnippetToolbar,
  SnippetViewer,
  getSnippetPermissions,
} from "@/features/snippets";
import { AttachmentPreview } from "@/features/snippets/components/attachment-preview";
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

  // A file/image snippet carries its attachment location in metadata.
  const meta = snippet.metadata;
  const attachmentPath = typeof meta.path === "string" ? meta.path : null;
  const attachmentKind = typeof meta.kind === "string" ? meta.kind : "file";
  const attachmentMime = typeof meta.mimeType === "string" ? meta.mimeType : "application/octet-stream";
  const attachmentSize = typeof meta.size === "number" ? meta.size : undefined;

  return (
    <div className="flex flex-col gap-6">
      <SnippetHeader snippet={snippet} permissions={permissions} />
      <SnippetToolbar snippet={snippet} />
      {attachmentPath ? (
        <AttachmentPreview
          path={attachmentPath}
          kind={attachmentKind}
          mimeType={attachmentMime}
          name={snippet.title ?? snippet.content}
          size={attachmentSize}
        />
      ) : (
        <SnippetViewer content={snippet.content} language={snippet.language} />
      )}
    </div>
  );
}
