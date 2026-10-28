import { ExternalLink } from "lucide-react";

import { ItemRow, MetaDot } from "@/components/items/item-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { FileIcon } from "@/components/ui/file-icon";
import { RelativeTime } from "@/components/ui/relative-time";
import { FileDownloadButton } from "@/features/library/components/file-download-button";
import { libraryTypeForKind, sourceLabel } from "@/features/library/config";
import type { LibraryItem } from "@/features/snippets/types";
import { resolveItemKind } from "@/lib/item-kinds";
import { expiryLabel } from "@/lib/retention";
import { displayHost, safeWebUrl } from "@/lib/safe-url";

/**
 * A link, document or file in the Library, from the shared item family. Links
 * show their site and open or copy in one tap; files show their type and
 * download directly. The row opens the item's own page.
 */
export function LibraryRow({ item }: { item: LibraryItem }) {
  const href = `/dashboard/library/${libraryTypeForKind(item.kind)}/${item.id}`;
  const source = sourceLabel(item.source);
  const kind = resolveItemKind(item.kind, "file");
  const isLink = item.kind === "url";
  const link = isLink ? safeWebUrl(item.name) : null;
  const host = isLink ? displayHost(item.name) : null;

  const meta = (
    <>
      <RelativeTime value={item.createdAt} />
      {source ? (
        <>
          <MetaDot />
          <span>from {source}</span>
        </>
      ) : null}
      <Badge variant={item.kept ? "primary" : "muted"}>{expiryLabel(item.createdAt, item.kept)}</Badge>
    </>
  );

  if (isLink) {
    return (
      <ItemRow
        kind={kind}
        title={host ?? item.name}
        href={href}
        preview={<p className="truncate font-mono text-xs text-muted-foreground">{item.name}</p>}
        meta={meta}
        primaryAction={
          <span className="flex items-center gap-1.5">
            <CopyButton value={item.name} iconOnly variant="ghost" srContext="link" />
            {link ? (
              <Button asChild size="sm" variant="outline">
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink aria-hidden="true" />
                  Open
                </a>
              </Button>
            ) : null}
          </span>
        }
      />
    );
  }

  return (
    <ItemRow
      kind={kind}
      title={item.name}
      href={href}
      media={<FileIcon name={item.name} mimeType={item.mimeType} size="sm" />}
      meta={meta}
      primaryAction={item.path ? <FileDownloadButton path={item.path} name={item.name} /> : null}
    />
  );
}
