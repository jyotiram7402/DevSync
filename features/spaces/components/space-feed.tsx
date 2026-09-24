"use client";

import { useState } from "react";

import { SpaceItemCard } from "@/features/spaces/components/space-item";
import type { SpaceCategory, SpaceItem } from "@/features/spaces/types";
import { cn } from "@/utils/cn";

type Tab = "all" | SpaceCategory;

const TABS: readonly { value: Tab; label: string; empty: string }[] = [
  { value: "all", label: "All", empty: "Nothing shared yet. Share an error, code or a file above." },
  { value: "error", label: "Errors", empty: "No errors shared yet." },
  { value: "code", label: "Code", empty: "No code shared yet." },
  { value: "doc", label: "Docs", empty: "No documents shared yet." },
  { value: "file", label: "Files", empty: "No files shared yet." },
];

/**
 * The room's content, split into category tabs. Tab state is client-side, so it
 * survives the realtime router.refresh() when new items arrive.
 */
export function SpaceFeed({ items, isOwner }: { items: SpaceItem[]; isOwner: boolean }) {
  const [tab, setTab] = useState<Tab>("all");

  const count = (value: Tab) =>
    value === "all" ? items.length : items.filter((item) => item.category === value).length;
  const visible = tab === "all" ? items : items.filter((item) => item.category === tab);
  const active = TABS.find((t) => t.value === tab) ?? TABS[0];

  return (
    <section className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="Filter room content"
        className="flex gap-1 overflow-x-auto border-b"
      >
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            id={`space-tab-${t.value}`}
            aria-selected={tab === t.value}
            aria-controls="space-tab-panel"
            onClick={() => setTab(t.value)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === t.value
                ? "border-brand font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-muted-foreground">{count(t.value)}</span>
          </button>
        ))}
      </div>

      <div id="space-tab-panel" role="tabpanel" aria-labelledby={`space-tab-${tab}`}>
        {visible.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            {active?.empty}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((item) => (
              <SpaceItemCard key={item.id} item={item} isOwner={isOwner} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
