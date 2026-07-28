import { SnippetCard } from "@/features/snippets/components/snippet-card";
import type { SnippetPermissions } from "@/features/snippets/permissions";
import type { Snippet } from "@/features/snippets/types";

export function SnippetGrid({
  snippets,
  permissions,
}: {
  snippets: Snippet[];
  permissions: SnippetPermissions;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {snippets.map((snippet) => (
        <SnippetCard key={snippet.id} snippet={snippet} permissions={permissions} />
      ))}
    </div>
  );
}
