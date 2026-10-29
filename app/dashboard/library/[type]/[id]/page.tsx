import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbLabel } from "@/components/dashboard/breadcrumb-label";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { KindBadge } from "@/components/ui/kind-badge";
import { RelativeTime } from "@/components/ui/relative-time";
import { isLibraryType, LIBRARY_META, sourceLabel } from "@/features/library/config";
import { AttachmentPreview } from "@/features/snippets/components/attachment-preview";
import { getSnippet } from "@/features/snippets/services/snippet-service";
import { resolveItemKind } from "@/lib/item-kinds";
import { displayHost, safeWebUrl } from "@/lib/safe-url";

export const metadata = {
  title: "Library item",
};

/**
 * A Library item on its own page, inside its category (Snippets stays for
 * code and text): the image, PDF or file with Open / Download, a link with
 * Open and Copy, or text in a code block.
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
    return (
      <ErrorState title="Couldn't load this item" description={result.error.message}>
        <Button asChild variant="outline">
          <Link href={`/dashboard/library/${type}/${id}`}>Try again</Link>
        </Button>
      </ErrorState>
    );
  }

  const { snippet } = result.data;
  const meta = snippet.metadata;
  const path = typeof meta.path === "string" ? meta.path : null;
  const rawKind = typeof meta.kind === "string" ? meta.kind : "file";
  const mimeType = typeof meta.mimeType === "string" ? meta.mimeType : "application/octet-stream";
  const size = typeof meta.size === "number" ? meta.size : undefined;
  const source = sourceLabel(typeof meta.source === "string" ? meta.source : null);
  const name = snippet.title ?? snippet.content;
  const link = rawKind === "url" ? safeWebUrl(snippet.content) : null;
  const host = rawKind === "url" ? displayHost(snippet.content) : null;

  return (
    <div className="flex flex-col gap-6">
      <BreadcrumbLabel label={host ?? name} />
      <PageHeader
        title={host ?? name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <KindBadge kind={resolveItemKind(rawKind, "file")} />
            <RelativeTime value={snippet.createdAt} toggleable />
            {source ? <span>from {source}</span> : null}
          </span>
        }
      />

      {path ? (
        <AttachmentPreview path={path} kind={rawKind} mimeType={mimeType} name={name} size={size} />
      ) : rawKind === "url" ? (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
          <p className="break-all font-mono text-sm text-foreground">{snippet.content}</p>
          <div className="flex flex-wrap gap-2">
            {link ? (
              <Button asChild>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink aria-hidden="true" />
                  Open link
                </a>
              </Button>
            ) : null}
            <CopyButton value={snippet.content} label="Copy link" />
          </div>
          <p className="text-xs text-muted-foreground">
            Links open in a new tab. {LIBRARY_META.links.description}
          </p>
        </div>
      ) : (
        <CodeBlock value={snippet.content} label="Text" />
      )}
    </div>
  );
}
