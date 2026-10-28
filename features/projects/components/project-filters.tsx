"use client";

import { LayoutGrid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import {
  DEFAULT_PROJECT_STATUS,
  PROJECT_STATUS_OPTIONS,
  parseProjectView,
  type ProjectView,
} from "@/features/projects/constants";

/**
 * Status filter (Active / Archived) and the Grid / List toggle. Both live in
 * the URL so the server re-renders; changing the status goes back to page 1.
 * The toggle is there on every screen size.
 */
export function ProjectFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? DEFAULT_PROJECT_STATUS;
  const view = parseProjectView(searchParams.get("view"));

  function setParam(key: string, value: string | null, resetPage = false) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (resetPage) params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        aria-label="Show"
        value={status}
        onChange={(event) =>
          setParam("status", event.target.value === DEFAULT_PROJECT_STATUS ? null : event.target.value, true)
        }
        className="w-auto"
      >
        {PROJECT_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <SegmentedControl<ProjectView>
        aria-label="View"
        value={view}
        onValueChange={(next) => setParam("view", next === "list" ? "list" : null)}
        options={[
          { value: "grid", label: "Grid", icon: LayoutGrid, iconOnly: true },
          { value: "list", label: "List", icon: List, iconOnly: true },
        ]}
      />
    </div>
  );
}
