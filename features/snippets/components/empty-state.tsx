import { Code2, Plus, SearchX } from "lucide-react";
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
        icon={SearchX}
        title="No snippets match"
        description="Try other words, or clear the filters to see everything."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/snippets">Clear filters</Link>
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={Code2}
      title="Paste your first snippet"
      description="An error, a command, a log or some code. Save it here and it shows up on your other devices in about a second."
      action={
        canCreate ? (
          <Button asChild>
            <Link href="/dashboard/snippets/new">
              <Plus aria-hidden="true" />
              New snippet
            </Link>
          </Button>
        ) : null
      }
    />
  );
}
