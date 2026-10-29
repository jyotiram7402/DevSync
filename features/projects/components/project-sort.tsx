"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent } from "react";

import { Select } from "@/components/ui/select";
import { DEFAULT_PROJECT_SORT, PROJECT_SORT_OPTIONS } from "@/features/projects/constants";

/** Sort order. Writes `?sort=` and goes back to page 1. */
export function ProjectSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? DEFAULT_PROJECT_SORT;

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (event.target.value === DEFAULT_PROJECT_SORT) params.delete("sort");
    else params.set("sort", event.target.value);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Select aria-label="Sort by" value={current} onChange={handleChange} className="w-auto">
      {PROJECT_SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
