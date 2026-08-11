"use client";

import { usePathname, useRouter } from "next/navigation";

import type { NoteListParams } from "@/features/notes/types";
import { cn } from "@/utils/cn";

const STATUS_TABS = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
] as const;

const DUE_CHIPS = [
  { value: "today", label: "Today" },
  { value: "overdue", label: "Overdue" },
  { value: "upcoming", label: "Upcoming" },
] as const;

const selectClass =
  "h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function NoteFilters({ params }: { params: NoteListParams }) {
  const router = useRouter();
  const pathname = usePathname();

  function apply(patch: Record<string, string | undefined>) {
    const merged: Record<string, string | undefined> = {
      status: params.status,
      priority: params.priority,
      tag: params.tag,
      due: params.due,
      sort: params.sort,
      ...patch,
    };
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const status = params.status ?? "active";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="Note status" className="flex gap-1">
          {STATUS_TABS.map((tab) => {
            const active = status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => apply({ status: tab.value === "active" ? undefined : tab.value })}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/50",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Priority"
            className={selectClass}
            value={params.priority ?? ""}
            onChange={(e) => apply({ priority: e.target.value || undefined })}
          >
            <option value="">Any priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            aria-label="Sort by"
            className={selectClass}
            value={params.sort ?? "due"}
            onChange={(e) => apply({ sort: e.target.value })}
          >
            <option value="due">Due date</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {DUE_CHIPS.map((chip) => {
          const active = params.due === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => apply({ due: active ? undefined : chip.value })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                active ? "border-brand bg-brand/10 text-brand" : "text-muted-foreground hover:bg-secondary/50",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
