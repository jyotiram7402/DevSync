"use client";

import { Code2, FileText, Files, Inbox, TriangleAlert, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { ArrivalFeed } from "@/components/items/arrival-feed";
import { EmptyState } from "@/components/shared/empty-state";
import { DialogFooter, ResponsiveDialog } from "@/components/ui/dialog";
import { ScrollableTabs } from "@/components/ui/scrollable-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDownloadButton } from "@/features/library/components/file-download-button";
import { showsImagePreview, SpaceItemRow } from "@/features/spaces/components/space-item";
import { spaceItemAuthor } from "@/features/spaces/display";
import type { SpaceCategory, SpaceItem } from "@/features/spaces/types";
import { useSupabase } from "@/hooks/use-supabase";
import { createSignedUrls } from "@/lib/storage/storage";

type Tab = "all" | SpaceCategory;

const TABS: ReadonlyArray<{ id: Tab; label: string; icon: LucideIcon; empty: string }> = [
  { id: "all", label: "All", icon: Inbox, empty: "Nothing here yet" },
  { id: "error", label: "Errors", icon: TriangleAlert, empty: "No errors shared yet" },
  { id: "code", label: "Code", icon: Code2, empty: "No code shared yet" },
  { id: "doc", label: "Docs", icon: FileText, empty: "No documents shared yet" },
  { id: "file", label: "Files", icon: Files, empty: "No files shared yet" },
];

function isTab(value: string): value is Tab {
  return TABS.some((tab) => tab.id === value);
}

/**
 * The room's shared items: a sticky, scrollable filter row (All · Errors ·
 * Code · Docs · Files) over a feed where items shared by others slide in live.
 * The filter is client state, so it survives the live refresh; images are
 * signed in one request and open in a viewer with Download.
 */
export function SpaceFeed({ items, isOwner }: { items: SpaceItem[]; isOwner: boolean }) {
  const supabase = useSupabase();
  const [tab, setTab] = useState<Tab>("all");
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(() => new Map());
  const [viewing, setViewing] = useState<SpaceItem | null>(null);

  const imagePathsKey = items
    .filter(showsImagePreview)
    .map((item) => item.path ?? "")
    .join("|");

  useEffect(() => {
    const paths = imagePathsKey.split("|").filter((path) => path.length > 0);
    if (paths.length === 0) return;
    let active = true;
    void createSignedUrls(supabase, "space-attachments", paths, 3600).then((result) => {
      if (active && result.ok) setImageUrls(result.data);
    });
    return () => {
      active = false;
    };
  }, [supabase, imagePathsKey]);

  const counts = new Map<Tab, number>([["all", items.length]]);
  for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);

  const visible = tab === "all" ? items : items.filter((item) => item.category === tab);
  const active = TABS.find((entry) => entry.id === tab) ?? TABS[0];
  const viewingUrl = viewing?.path ? imageUrls.get(viewing.path) : undefined;

  return (
    <section aria-label="Shared items" className="flex flex-col gap-3">
      {/* Sticks under the top bar (56px + the notch) while the feed scrolls. */}
      <div className="sticky top-[calc(env(safe-area-inset-top,0px)_+_3.5rem)] z-sticky -mx-4 border-b border-border bg-background/95 px-4 py-1 backdrop-blur-md supports-[backdrop-filter]:bg-background/85 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <ScrollableTabs
          aria-label="Show"
          activeId={tab}
          onSelect={(id) => {
            if (isTab(id)) setTab(id);
          }}
          items={TABS.map((entry) => ({ id: entry.id, label: entry.label, count: counts.get(entry.id) ?? 0 }))}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={active?.icon}
          title={active?.empty ?? "Nothing here yet"}
          description={
            tab === "doc" || tab === "file"
              ? "Attach a file with the paperclip. Everyone in the room can download it."
              : "Paste an error, a stack trace or some code and share it. Everyone in the room sees it right away."
          }
        />
      ) : (
        <ArrivalFeed
          label={tab === "all" ? "Shared items" : `Shared items: ${active?.label ?? ""}`}
          resetKey={tab}
          pillClassName="top-[calc(env(safe-area-inset-top,0px)_+_7.25rem)]"
          entries={visible.map((item) => ({
            id: item.id,
            node: (
              <SpaceItemRow
                item={item}
                isOwner={isOwner}
                imageUrl={item.path ? imageUrls.get(item.path) : undefined}
                onView={showsImagePreview(item) ? () => setViewing(item) : undefined}
              />
            ),
          }))}
        />
      )}

      <ResponsiveDialog
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.content ?? "Image"}
        description={viewing ? `Shared by ${spaceItemAuthor(viewing)}` : undefined}
        size="xl"
        footer={
          viewing?.path ? (
            <DialogFooter>
              <FileDownloadButton
                bucket="space-attachments"
                path={viewing.path}
                name={viewing.content}
                size="default"
                variant="default"
              />
            </DialogFooter>
          ) : null
        }
      >
        {viewing ? (
          viewingUrl ? (
            <img
              src={viewingUrl}
              alt={viewing.content}
              decoding="async"
              className="max-h-[60dvh] w-full rounded-md bg-muted object-contain"
            />
          ) : (
            <Skeleton className="aspect-video w-full" />
          )
        ) : null}
      </ResponsiveDialog>
    </section>
  );
}
