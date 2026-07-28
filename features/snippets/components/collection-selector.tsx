"use client";

import type { SelectOption } from "@/features/snippets/types";

/** Multi-select collections via an accessible checkbox list. */
export function CollectionSelector({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  options: SelectOption[];
}) {
  if (options.length === 0) {
    return <p className="text-sm text-muted-foreground">No collections yet.</p>;
  }

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((current) => current !== id) : [...value, id]);
  }

  return (
    <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md border p-2">
      {options.map((option) => (
        <label key={option.id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.includes(option.id)}
            onChange={() => toggle(option.id)}
            className="size-4 rounded border-input"
          />
          <span className="truncate">{option.name}</span>
        </label>
      ))}
    </div>
  );
}
