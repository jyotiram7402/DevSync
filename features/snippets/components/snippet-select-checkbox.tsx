"use client";

import { useSnippetSelection } from "@/features/snippets/hooks/use-snippet-selection";

/**
 * Lightweight selection checkbox leaf. Reads/writes the selection store so the
 * card/row it sits in can remain a server component.
 */
export function SnippetSelectCheckbox({ snippetId, label }: { snippetId: string; label: string }) {
  const selected = useSnippetSelection((state) => state.selectedIds.includes(snippetId));
  const toggle = useSnippetSelection((state) => state.toggle);

  return (
    <input
      type="checkbox"
      checked={selected}
      onChange={() => toggle(snippetId)}
      aria-label={`Select ${label}`}
      className="size-4 rounded border-input"
    />
  );
}
