"use client";

import type { SelectOption } from "@/features/snippets/types";

/** Project selector for a snippet. Empty value = no project (unfiled). */
export function ProjectSelector({
  value,
  onChange,
  options,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
}) {
  return (
    <select
      id={id}
      aria-label="Project"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <option value="">No project</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}
