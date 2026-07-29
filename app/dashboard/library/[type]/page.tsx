import { notFound } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { LibraryItemRow } from "@/features/library/components/library-item";
import { isLibraryType, LIBRARY_KINDS, LIBRARY_META } from "@/features/library/config";
import { listLibraryItems } from "@/features/snippets/services/snippet-service";
import type { LibraryItem } from "@/features/snippets/types";

const DAY_MS = 86_400_000;

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
  const items = result.ok ? result.data : [];
  const groups = groupByDate(items);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={meta.title} description={meta.description} />

      {items.length === 0 ? (
        <EmptyState
          title={`No ${meta.title.toLowerCase()} yet`}
          description="Anything you sync of this type will show up here, newest first."
        />
      ) : (
        groups.map((group) => (
          <section key={group.label} className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">{group.label}</h2>
            <div className="flex flex-col gap-2">
              {group.items.map((item) => (
                <LibraryItemRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
