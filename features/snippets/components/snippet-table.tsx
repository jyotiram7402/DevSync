import { Pin, Star } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { SnippetMenu } from "@/features/snippets/components/snippet-menu";
import { SnippetSelectCheckbox } from "@/features/snippets/components/snippet-select-checkbox";
import { getLanguageLabel } from "@/features/snippets/languages";
import type { SnippetPermissions } from "@/features/snippets/permissions";
import type { Snippet } from "@/features/snippets/types";
import { formatRelativeTime } from "@/utils/date";

export function SnippetTable({
  snippets,
  permissions,
}: {
  snippets: Snippet[];
  permissions: SnippetPermissions;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[40rem] text-sm">
        <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="w-8 px-4 py-2.5">
              <span className="sr-only">Select</span>
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Title
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Language
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Updated
            </th>
            <th scope="col" className="px-4 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {snippets.map((snippet) => {
            const title = snippet.title ?? "Untitled snippet";
            return (
              <tr key={snippet.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3 align-middle">
                  <SnippetSelectCheckbox snippetId={snippet.id} label={title} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/snippets/${snippet.id}`}
                      className="rounded-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {title}
                    </Link>
                    {snippet.pinned ? (
                      <Pin className="size-3 fill-current text-muted-foreground" aria-label="Pinned" />
                    ) : null}
                    {snippet.favorite ? (
                      <Star className="size-3 fill-current text-amber-500" aria-label="Favorite" />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="muted" className="font-mono">
                    {getLanguageLabel(snippet.language)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatRelativeTime(snippet.updatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <SnippetMenu snippet={snippet} permissions={permissions} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
