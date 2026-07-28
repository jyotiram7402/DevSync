import { Code2, Plus } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export function SnippetEmptyState({
  filtered,
  canCreate,
}: {
  filtered: boolean;
  canCreate: boolean;
}) {
  if (filtered) {
    return (
      <EmptyState
        icon={Code2}
        title="No snippets found"
        description="No snippets match your current search and filters."
      />
    );
  }

  return (
    <EmptyState
      icon={Code2}
      title="No snippets yet"
      description="Capture an error, log, or command to keep it in sync across your devices."
      action={
        canCreate ? (
          <Button asChild size="sm">
            <Link href="/dashboard/snippets/new">
              <Plus />
              New snippet
            </Link>
          </Button>
        ) : null
      }
    />
  );
}
