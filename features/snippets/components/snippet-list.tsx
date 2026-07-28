import { SnippetCard } from "@/features/snippets/components/snippet-card";
import type { SnippetPermissions } from "@/features/snippets/permissions";
import type { Snippet } from "@/features/snippets/types";

export function SnippetList({
  snippets,
  permissions,
}: {
  snippets: Snippet[];
  permissions: SnippetPermissions;
}) {
  return (
    <div className="flex flex-col gap-3">
      {snippets.map((snippet) => (
        <SnippetCard key={snippet.id} snippet={snippet} permissions={permissions} />
      ))}
    </div>
  );
}
