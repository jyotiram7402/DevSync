import { CheckCircle2, ListTodo } from "lucide-react";
import Link from "next/link";

import { DashboardCard } from "@/components/shared/dashboard-card";
import { Button } from "@/components/ui/button";
import { NoteItem } from "@/features/notes/components/note-item";
import { NoteQuickAdd } from "@/features/notes/components/note-quick-add";
import type { NoteBuckets } from "@/features/notes/types";
import { cn } from "@/utils/cn";

/** Compact Quick Notes summary for the dashboard home. */
export function NotesWidget({ buckets }: { buckets: NoteBuckets }) {
  const focus = [...buckets.overdue, ...buckets.today].slice(0, 4);
  const stats = [
    { label: "Overdue", value: buckets.overdue.length, tone: "text-red-500" },
    { label: "Today", value: buckets.today.length, tone: "text-brand" },
    { label: "Upcoming", value: buckets.upcoming.length, tone: "text-muted-foreground" },
  ];

  return (
    <DashboardCard
      title="Quick Notes"
      description="Personal to-dos, synced across your devices."
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/notes">Open</Link>
        </Button>
      }
      className="lg:col-span-2"
    >
      <div className="flex flex-col gap-4">
        <NoteQuickAdd />

        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border p-2 text-center">
              <p className={cn("text-lg font-semibold tabular-nums", stat.tone)}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
          <div className="rounded-lg border p-2 text-center">
            <p className="flex items-center justify-center gap-1 text-lg font-semibold tabular-nums text-emerald-500">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {buckets.completedCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Done</p>
          </div>
        </div>

        {focus.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {focus.map((note) => (
              <NoteItem key={note.id} note={note} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-1 py-4 text-center">
            <ListTodo className="size-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Nothing due. You're all caught up.</p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
