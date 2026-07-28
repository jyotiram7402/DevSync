import { Badge } from "@/components/ui/badge";
import { SnippetActions } from "@/features/snippets/components/snippet-actions";
import { getLanguageLabel } from "@/features/snippets/languages";
import type { SnippetPermissions } from "@/features/snippets/permissions";
import type { Snippet, SnippetVisibility } from "@/features/snippets/types";

const VISIBILITY_LABEL: Record<SnippetVisibility, string> = {
  private: "Private",
  workspace: "Workspace",
  public: "Public",
};

export function SnippetHeader({
  snippet,
  permissions,
}: {
  snippet: Snippet;
  permissions: SnippetPermissions;
}) {
  const title = snippet.title ?? "Untitled snippet";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
          {snippet.archived ? <Badge variant="muted">Archived</Badge> : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="muted" className="font-mono">
            {getLanguageLabel(snippet.language)}
          </Badge>
          <Badge variant="outline">{VISIBILITY_LABEL[snippet.visibility]}</Badge>
          {snippet.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className="shrink-0">
        <SnippetActions snippet={snippet} permissions={permissions} />
      </div>
    </div>
  );
}
