import { Archive, Pin, Star } from "lucide-react";

import { ItemPreview } from "@/components/items/item-preview";
import { ItemRow, MetaDot } from "@/components/items/item-row";
import { CopyButton } from "@/components/ui/copy-button";
import { RelativeTime } from "@/components/ui/relative-time";
import { SnippetMenu } from "@/features/snippets/components/snippet-menu";
import { SnippetSelectCheckbox } from "@/features/snippets/components/snippet-select-checkbox";
import { snippetTitleAndPreview } from "@/features/snippets/display";
import { getLanguageLabel } from "@/features/snippets/languages";
import type { SnippetPermissions } from "@/features/snippets/permissions";
import type { Snippet } from "@/features/snippets/types";
import { ITEM_KINDS, isCodeLikeKind, resolveItemKind } from "@/lib/item-kinds";

/**
 * A snippet in a feed, from the shared item family. `selectable` adds the
 * checkbox for bulk actions (lists that have the bulk action bar).
 */
export function SnippetRow({
  snippet,
  permissions,
  selectable = true,
}: {
  snippet: Snippet;
  permissions: SnippetPermissions;
  selectable?: boolean;
}) {
  const kind = resolveItemKind(snippet.type);
  const { title, preview } = snippetTitleAndPreview(snippet);
  const language = snippet.language && snippet.language !== "plaintext" ? getLanguageLabel(snippet.language) : null;

  return (
    <ItemRow
      kind={kind}
      title={title}
      href={`/dashboard/snippets/${snippet.id}`}
      leading={selectable ? <SnippetSelectCheckbox snippetId={snippet.id} label={title} /> : undefined}
      badges={
        snippet.pinned || snippet.favorite || snippet.archived ? (
          <>
            {snippet.pinned ? (
              <>
                <Pin className="size-3.5 fill-current text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Pinned</span>
              </>
            ) : null}
            {snippet.favorite ? (
              <>
                <Star className="size-3.5 fill-current text-favorite" aria-hidden="true" />
                <span className="sr-only">Favorite</span>
              </>
            ) : null}
            {snippet.archived ? (
              <>
                <Archive className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Archived</span>
              </>
            ) : null}
          </>
        ) : null
      }
      preview={preview ? <ItemPreview text={preview} code={isCodeLikeKind(kind)} /> : null}
      meta={
        <>
          <span>{ITEM_KINDS[kind].label}</span>
          {language ? (
            <>
              <MetaDot />
              <span>{language}</span>
            </>
          ) : null}
          <MetaDot />
          <RelativeTime value={snippet.updatedAt} />
        </>
      }
      primaryAction={<CopyButton value={snippet.content} srContext={title} />}
      menu={<SnippetMenu snippet={snippet} permissions={permissions} />}
    />
  );
}
