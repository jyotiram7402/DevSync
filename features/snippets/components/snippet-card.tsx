import { Pin, Star } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/features/snippets/components/copy-button";
import { SnippetMenu } from "@/features/snippets/components/snippet-menu";
import { SnippetPreview } from "@/features/snippets/components/snippet-preview";
import { SnippetSelectCheckbox } from "@/features/snippets/components/snippet-select-checkbox";
import { getLanguageLabel } from "@/features/snippets/languages";
import type { SnippetPermissions } from "@/features/snippets/permissions";
import type { Snippet } from "@/features/snippets/types";
import { formatRelativeTime } from "@/utils/date";

/** Snippet card (server component) with client leaves for selection/copy/menu. */
export function SnippetCard({
  snippet,
  permissions,
}: {
  snippet: Snippet;
  permissions: SnippetPermissions;
}) {
  const title = snippet.title ?? "Untitled snippet";

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative z-10 flex items-center">
            <SnippetSelectCheckbox snippetId={snippet.id} label={title} />
          </span>
          <Badge variant="muted" className="font-mono">
            {getLanguageLabel(snippet.language)}
          </Badge>
          {snippet.pinned ? (
            <Pin className="size-3.5 fill-current text-muted-foreground" aria-label="Pinned" />
          ) : null}
          {snippet.favorite ? (
            <Star className="size-3.5 fill-current text-amber-500" aria-label="Favorite" />
          ) : null}
        </div>
        <div className="relative z-10 flex items-center gap-1">
          <CopyButton snippet={snippet} variant="ghost" size="icon" />
          <SnippetMenu snippet={snippet} permissions={permissions} />
        </div>
      </div>

      <h3 className="min-w-0 truncate font-medium">
        <Link
          href={`/dashboard/snippets/${snippet.id}`}
          className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {title}
        </Link>
      </h3>

      <SnippetPreview content={snippet.content} maxLines={4} />

      <div className="mt-auto flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {snippet.archived ? <Badge variant="muted">Archived</Badge> : null}
        {snippet.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
        <span className="ml-auto shrink-0">Updated {formatRelativeTime(snippet.updatedAt)}</span>
      </div>
    </div>
  );
}
