import { Badge } from "@/components/ui/badge";
import { KindBadge } from "@/components/ui/kind-badge";
import { RelativeTime } from "@/components/ui/relative-time";
import { SnippetActions } from "@/features/snippets/components/snippet-actions";
import { snippetTitleAndPreview } from "@/features/snippets/display";
import { getLanguageLabel } from "@/features/snippets/languages";
import type { SnippetPermissions } from "@/features/snippets/permissions";
import type { Snippet, SnippetVisibility } from "@/features/snippets/types";
import { resolveItemKind } from "@/lib/item-kinds";

const VISIBILITY_LABEL: Record<SnippetVisibility, string> = {
  private: "Private",
  workspace: "Workspace",
  public: "Public",
};

/** Snippet page header: title, kind, language, visibility, tags, when, and actions. */
export function SnippetHeader({
  snippet,
  permissions,
}: {
  snippet: Snippet;
  permissions: SnippetPermissions;
}) {
  const { title } = snippetTitleAndPreview(snippet);
  const language = snippet.language && snippet.language !== "plaintext" ? getLanguageLabel(snippet.language) : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight [overflow-wrap:anywhere] md:text-2xl">{title}</h1>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <KindBadge kind={resolveItemKind(snippet.type)} />
          {language ? <Badge variant="outline">{language}</Badge> : null}
          <Badge variant="outline">{VISIBILITY_LABEL[snippet.visibility]}</Badge>
          {snippet.archived ? <Badge variant="muted">Archived</Badge> : null}
          {snippet.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          <span className="ml-1">
            Updated <RelativeTime value={snippet.updatedAt} toggleable />
          </span>
        </div>
      </div>
      <div className="shrink-0">
        <SnippetActions snippet={snippet} permissions={permissions} />
      </div>
    </div>
  );
}
