"use client";

import { LayoutGrid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { DEFAULT_SNIPPET_STATUS, SNIPPET_STATUS_OPTIONS } from "@/features/snippets/constants";
import { SNIPPET_LANGUAGES } from "@/features/snippets/languages";

type SnippetView = "list" | "grid";

/** Status + language filters and a list/grid view toggle (view from md up). */
export function SnippetFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? DEFAULT_SNIPPET_STATUS;
  const language = searchParams.get("language") ?? "";
  const view: SnippetView = searchParams.get("view") === "grid" ? "grid" : "list";

  function setParam(key: string, value: string, resetPage = false) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (resetPage) params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        aria-label="Show"
        value={status}
        onChange={(event) => setParam("status", event.target.value, true)}
        className="w-auto"
      >
        {SNIPPET_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Language"
        value={language}
        onChange={(event) => setParam("language", event.target.value, true)}
        className="w-auto"
      >
        <option value="">All languages</option>
        {SNIPPET_LANGUAGES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </Select>

      <SegmentedControl<SnippetView>
        aria-label="View"
        value={view}
        onValueChange={(next) => setParam("view", next === "grid" ? "grid" : "")}
        options={[
          { value: "list", label: "List", icon: List, iconOnly: true },
          { value: "grid", label: "Grid", icon: LayoutGrid, iconOnly: true },
        ]}
        className="hidden md:inline-flex"
      />
    </div>
  );
}
