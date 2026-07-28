"use client";

import { LayoutGrid, Table as TableIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DEFAULT_SNIPPET_STATUS, SNIPPET_STATUS_OPTIONS } from "@/features/snippets/constants";
import { SNIPPET_LANGUAGES } from "@/features/snippets/languages";

/** Status + language filters and a grid/table view toggle. */
export function SnippetFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? DEFAULT_SNIPPET_STATUS;
  const language = searchParams.get("language") ?? "";
  const view = searchParams.get("view") === "table" ? "table" : "grid";

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
      <select
        aria-label="Filter by status"
        value={status}
        onChange={(event) => setParam("status", event.target.value, true)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {SNIPPET_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by language"
        value={language}
        onChange={(event) => setParam("language", event.target.value, true)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">All languages</option>
        {SNIPPET_LANGUAGES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>

      <div className="hidden items-center rounded-md border p-0.5 sm:flex" role="group" aria-label="View">
        <Button
          type="button"
          variant={view === "grid" ? "secondary" : "ghost"}
          size="icon"
          aria-label="Grid view"
          aria-pressed={view === "grid"}
          className="size-7"
          onClick={() => setParam("view", "grid")}
        >
          <LayoutGrid className="size-4" />
        </Button>
        <Button
          type="button"
          variant={view === "table" ? "secondary" : "ghost"}
          size="icon"
          aria-label="Table view"
          aria-pressed={view === "table"}
          className="size-7"
          onClick={() => setParam("view", "table")}
        >
          <TableIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
