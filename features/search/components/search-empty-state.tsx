import { SearchX, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

/**
 * SearchEmptyState — the idle prompt (no query yet) and the no-results state,
 * selected via `variant`.
 */
export function SearchEmptyState({
  variant,
  query,
}: {
  variant: "idle" | "no-results";
  query?: string;
}) {
  if (variant === "no-results") {
    return (
      <EmptyState
        icon={SearchX}
        title="No results found"
        description={
          query && query.length > 0
            ? `Nothing matched “${query}”. Try different keywords or clear your filters.`
            : "Try different keywords or clear your filters."
        }
      />
    );
  }

  return (
    <EmptyState
      icon={Sparkles}
      title="Search everything"
      description="Find snippets, projects, collections, and tags across your workspace."
    />
  );
}
