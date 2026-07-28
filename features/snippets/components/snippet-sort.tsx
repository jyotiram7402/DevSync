"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DEFAULT_SNIPPET_SORT, SNIPPET_SORT_OPTIONS } from "@/features/snippets/constants";

export function SnippetSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? DEFAULT_SNIPPET_SORT;

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", event.target.value);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      aria-label="Sort snippets"
      value={current}
      onChange={handleChange}
      className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {SNIPPET_SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
