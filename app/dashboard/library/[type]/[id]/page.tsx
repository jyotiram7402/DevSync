import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { isLibraryType, LIBRARY_META } from "@/features/library/config";
import { AttachmentPreview } from "@/features/snippets/components/attachment-preview";
import { getSnippet } from "@/features/snippets/services/snippet-service";

export const metadata = {
  title: "Library item",
};

/**
 * Category-native detail view. Library items (images, links, docs, files) open
 * here, inside their category — Snippets stays reserved for code/text.
 */
export default async function LibraryItemPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (!isLibraryType(type)) notFound();

  const result = await getSnippet(id);
  if (!result.ok) {
    if (result.error.code === "NOT_FOUND") notFound();
    return <EmptyState title="Unable to load item" description={result.error.message} />;
  }

  const { snippet } = result.data;
  const meta = snippet.metadata;
  const path = typeof meta.path === "string" ? meta.path : null;
  const kind = typeof meta.kind === "string" ? meta.kind : "file";
  const mimeType = typeof meta.mimeType === "string" ? meta.mimeType : "application/octet-stream";
  const size = typeof meta.size === "number" ? meta.size : undefined;
  const name = snippet.title ?? snippet.content;
  const libraryTitle = LIBRARY_META[type].title;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/dashboard/library/${type}`}
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to {libraryTitle}
      </Link>

      <PageHeader title={name} />

      {path ? (
        <AttachmentPreview path={path} kind={kind} mimeType={mimeType} name={name} size={size} />
      ) : kind === "url" ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border p-4">
          <a
            href={snippet.content}
            target="_blank"
            rel="noreferrer"
            className="break-all text-sm text-brand hover:underline"
          >
            {snippet.content}
          </a>
          <Button asChild>
            <a href={snippet.content} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" aria-hidden="true" />
              Open link
            </a>
          </Button>
        </div>
      ) : (
        <pre className="overflow-x-auto rounded-lg border p-4 text-sm">{snippet.content}</pre>
      )}
    </div>
  );
}
