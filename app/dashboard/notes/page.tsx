import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
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

  return (
    <div className="flex flex-col gap-6">
      {user ? <NotesLiveRefresh userId={user.id} /> : null}

      <PageHeader
        title="Quick Notes"
        description="Personal to-dos and reminders, synced across every device."
      />

      <NoteQuickAdd autoFocus />
      <NoteFilters params={params} />

      {!result.ok ? (
        <EmptyState title="Unable to load notes" description={result.error.message} />
      ) : notes.length === 0 ? (
        <EmptyState
          title={params.status === "archived" ? "No archived notes" : "No notes yet"}
          description={
            params.status === "archived"
              ? "Archived notes will appear here."
              : "Add your first note above — it syncs to all your devices instantly."
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </ul>
      )}
    </div>
  );
}
