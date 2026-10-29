"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useSnippetSelection } from "@/features/snippets/hooks/use-snippet-selection";

/**
 * Selection checkbox leaf for bulk actions. Reads/writes the selection store
 * so the row it sits in can remain a server component. 44px hit area on touch.
 */
export function SnippetSelectCheckbox({ snippetId, label }: { snippetId: string; label: string }) {
  const selected = useSnippetSelection((state) => state.selectedIds.includes(snippetId));
  const toggle = useSnippetSelection((state) => state.toggle);

  return <Checkbox checked={selected} onChange={() => toggle(snippetId)} aria-label={`Select ${label}`} />;
}
