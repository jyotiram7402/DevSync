"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select } from "@/components/ui/select";
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
    <Select aria-label="Sort by" value={current} onChange={handleChange} className="w-auto">
      {SNIPPET_SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
