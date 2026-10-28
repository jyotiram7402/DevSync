import { ChevronDown, ListTodo } from "lucide-react";
import Link from "next/link";

import { ArrivalFeed } from "@/components/items/arrival-feed";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { NoteFilters } from "@/features/notes/components/note-filters";
import { NoteItem } from "@/features/notes/components/note-item";
import { NoteQuickAdd } from "@/features/notes/components/note-quick-add";
import { NotesLiveRefresh } from "@/features/notes/components/notes-live-refresh";
import { noteListParamsSchema } from "@/features/notes/schemas";
import { listNotes } from "@/features/notes/services/note-service";
import type { NoteListParams } from "@/features/notes/types";
import { getServerUser } from "@/lib/auth/session";

export const metadata = { title: "Quick Notes" };

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const parsed = noteListParamsSchema.safeParse({
    status: firstValue(sp.status),
    priority: firstValue(sp.priority),
    tag: firstValue(sp.tag),
    due: firstValue(sp.due),
    sort: firstValue(sp.sort),
  });
  const params: NoteListParams = parsed.success ? parsed.data : {};

  const [user, result] = await Promise.all([getServerUser(), listNotes(params)]);
  const notes = result.ok ? result.data : [];
  // In the default view, finished notes fold away into "Done".
  const splitDone = params.status === undefined || params.status === "active";
  const open = splitDone ? notes.filter((note) => note.status !== "completed") : notes;
  const done = splitDone ? notes.filter((note) => note.status === "completed") : [];
  const listKey = JSON.stringify(params);

  return (
    <div className="flex flex-col gap-5">
      {user ? <NotesLiveRefresh userId={user.id} /> : null}

      <PageHeader title="Quick Notes" description="To-dos and reminders, on all your devices." />

      <NoteQuickAdd autoFocus />
      <NoteFilters params={params} />

      {!result.ok ? (
        <ErrorState title="Couldn't load your notes" description={result.error.message}>
          <Button asChild variant="outline">
            <Link href="/dashboard/notes">Try again</Link>
          </Button>
        </ErrorState>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title={params.status === "archived" ? "No archived notes" : "Nothing to do yet"}
          description={
            params.status === "archived"
              ? "Notes you archive appear here."
              : "Add a to-do or a reminder above. It shows up on all your devices."
          }
        />
      ) : (
        <>
          {open.length > 0 ? (
            <ArrivalFeed
              label="Notes"
              resetKey={listKey}
              entries={open.map((note) => ({ id: note.id, node: <NoteItem note={note} /> }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">All done. Nice.</p>
          )}

          {done.length > 0 ? (
            <details className="group rounded-lg border border-border" open={open.length === 0}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-4 text-sm font-medium transition-colors duration-fast hover:bg-accent [&::-webkit-details-marker]:hidden">
                Done ({done.length})
                <ChevronDown
                  className="size-4 text-muted-foreground transition-transform duration-base group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <ul aria-label="Done" className="flex flex-col gap-2 p-2 pt-0">
                {done.map((note) => (
                  <li key={note.id}>
                    <NoteItem note={note} />
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}
    </div>
  );
}
