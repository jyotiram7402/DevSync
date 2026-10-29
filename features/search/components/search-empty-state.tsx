import { SearchX, Sparkles, X } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

/**
 * SearchEmptyState — the idle prompt (no query yet) and the no-results state,
 * selected via `variant`. With filters on, "no results" offers Clear filters.
 */
export function SearchEmptyState({
  variant,
  query,
  onClearFilters,
}: {
  variant: "idle" | "no-results";
  query?: string;
  onClearFilters?: () => void;
}) {
  if (variant === "no-results") {
    return (
      <EmptyState
        icon={SearchX}
        title="No results"
        description={
          query && query.trim().length > 0
            ? `Nothing matched “${query.trim()}”. Try other words${onClearFilters ? " or clear the filters" : ""}.`
            : onClearFilters
              ? "Nothing matches these filters."
              : "Nothing here yet."
        }
        action={
          onClearFilters ? (
            <Button type="button" variant="outline" onClick={onClearFilters}>
              <X aria-hidden="true" />
              Clear filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <EmptyState
      icon={Sparkles}
      title="Search everything"
      description="Find snippets, projects and tags by any word in them."
    />
  );
}
