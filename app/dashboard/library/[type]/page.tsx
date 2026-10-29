import { FileText, Files, Image as ImageIcon, Link2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrivalFeed } from "@/components/items/arrival-feed";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { LiveRefresh } from "@/features/dashboard/components/live-refresh";
import { LibraryAdd } from "@/features/library/components/library-add";
import { LibraryImageGrid } from "@/features/library/components/library-image-grid";
import { LibraryRow } from "@/features/library/components/library-row";
import { LibraryTabs } from "@/features/library/components/library-tabs";
import { isLibraryType, LIBRARY_KINDS, LIBRARY_META, type LibraryType } from "@/features/library/config";
import { listLibraryItems } from "@/features/snippets/services/snippet-service";
import type { LibraryItem } from "@/features/snippets/types";

const DAY_MS = 86_400_000;

const EMPTY_STATES: Record<LibraryType, { icon: typeof ImageIcon; title: string; description: string }> = {
  images: {
    icon: ImageIcon,
    title: "No images yet",
    description: "Add a photo or a screenshot. It shows up on your other devices in about a second.",
  },
  links: {
    icon: Link2,
    title: "No links yet",
    description: "Save a web address here, or paste one anywhere in the app. It lands in Links.",
  },
  docs: {
    icon: FileText,
    title: "No documents yet",
    description: "PDFs and Word, Excel or PowerPoint files you add show up here.",
  },
  files: {
    icon: Files,
    title: "No files yet",
    description: "Archives, audio, video and anything else you add show up here.",
  },
};

function startOfToday(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

/** Segregate items into Today / Yesterday / This week / Earlier buckets. */
function groupByDate(items: LibraryItem[]): { label: string; items: LibraryItem[] }[] {
  const today = startOfToday();
  const yesterday = today - DAY_MS;
  const week = today - 6 * DAY_MS;
  const buckets: Record<string, LibraryItem[]> = {
    Today: [],
    Yesterday: [],
    "This week": [],
    Earlier: [],
  };

  for (const item of items) {
    const time = new Date(item.createdAt).getTime();
    if (Number.isNaN(time) || time < week) buckets.Earlier?.push(item);
    else if (time >= today) buckets.Today?.push(item);
    else if (time >= yesterday) buckets.Yesterday?.push(item);
    else buckets["This week"]?.push(item);
  }

  return (["Today", "Yesterday", "This week", "Earlier"] as const)
    .map((label) => ({ label, items: buckets[label] ?? [] }))
    .filter((group) => group.items.length > 0);
}

export default async function LibraryPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isLibraryType(type)) notFound();

  const meta = LIBRARY_META[type];
  const result = await listLibraryItems([...LIBRARY_KINDS[type]]);

  const header = (
    <>
      <PageHeader title={meta.title} description={meta.description} actions={<LibraryAdd type={type} />} />
      <LibraryTabs active={type} />
    </>
  );

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-5">
        {header}
        <ErrorState title={`Couldn't load your ${meta.title.toLowerCase()}`} description={result.error.message}>
          <Button asChild variant="outline">
            <Link href={`/dashboard/library/${type}`}>Try again</Link>
          </Button>
        </ErrorState>
      </div>
    );
  }

  const { items, workspaceId } = result.data;
  const groups = groupByDate(items);
  const empty = EMPTY_STATES[type];

  return (
    <div className="flex flex-col gap-5">
      {/* Uploads from your other devices appear here without a reload. */}
      <LiveRefresh workspaceId={workspaceId} />
      {header}

      {items.length === 0 ? (
        <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />
      ) : (
        groups.map((group) => (
          <section key={group.label} aria-label={group.label} className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">{group.label}</h2>
            {type === "images" ? (
              <LibraryImageGrid items={group.items} />
            ) : (
              <ArrivalFeed
                label={`${meta.title}, ${group.label}`}
                resetKey={type}
                entries={group.items.map((item) => ({ id: item.id, node: <LibraryRow item={item} /> }))}
              />
            )}
          </section>
        ))
      )}
    </div>
  );
}
