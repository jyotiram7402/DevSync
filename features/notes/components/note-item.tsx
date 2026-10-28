"use client";

import { Archive, ArchiveRestore, Check, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { deleteNoteAction, patchNoteAction } from "@/features/notes/actions";
import { NoteEditDialog } from "@/features/notes/components/note-edit-dialog";
import { dueMeta, PRIORITY_TONE } from "@/features/notes/note-utils";
import type { Note } from "@/features/notes/types";
import { cn } from "@/utils/cn";

const TONE: Record<"overdue" | "today" | "upcoming", string> = {
  overdue: "text-destructive bg-destructive/10",
  today: "text-primary-ink bg-primary/10",
  upcoming: "text-muted-foreground bg-muted",
};

/**
 * One note: a 44px complete toggle, the title and details with date/priority
 * chips, Pin, and a menu (edit, archive or restore, delete — which asks first).
 * The list around it provides the <li>.
 */
export function NoteItem({ note }: { note: Note }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, setPending] = useState(false);
  const completed = note.status === "completed";
  const due = dueMeta(note.dueDate, note.dueTime);

  async function patch(values: Parameters<typeof patchNoteAction>[1]) {
    setPending(true);
    const result = await patchNoteAction(note.id, values);
    setPending(false);
    if (!result.ok) toast.error(result.error.message);
    else router.refresh();
  }

  async function remove() {
    setPending(true);
    const result = await deleteNoteAction(note.id);
    setPending(false);
    setConfirmDelete(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Note deleted.");
    router.refresh();
  }

  const items: MenuEntry[] = [
    { label: "Edit", icon: Pencil, onSelect: () => setEditing(true) },
    {
      label: note.archived ? "Restore" : "Archive",
      icon: note.archived ? ArchiveRestore : Archive,
      onSelect: () => void patch({ archived: !note.archived }),
    },
    "separator",
    { label: "Delete", icon: Trash2, destructive: true, onSelect: () => setConfirmDelete(true) },
  ];

  return (
    <div
      className={cn(
        "flex items-start gap-1 rounded-lg border border-border bg-card py-1 pl-1 pr-1 transition-opacity duration-fast sm:py-2",
        pending && "opacity-60",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        aria-label={completed ? `Mark "${note.title}" not done` : `Mark "${note.title}" done`}
        onClick={() => void patch({ status: completed ? "pending" : "completed" })}
        disabled={pending}
        className="group flex size-11 shrink-0 items-center justify-center rounded-full"
      >
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-full border transition-colors duration-fast",
            completed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input group-hover:border-primary group-active:border-primary",
          )}
        >
          {completed ? <Check className="size-3.5 animate-pop" strokeWidth={3} aria-hidden="true" /> : null}
        </span>
      </button>

      <div className="min-w-0 flex-1 py-2.5">
        <p
          className={cn(
            "text-sm font-medium [overflow-wrap:anywhere]",
            completed && "text-muted-foreground line-through",
          )}
        >
          {note.title}
        </p>
        {note.content ? (
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground [overflow-wrap:anywhere]">{note.content}</p>
        ) : null}
        {due || note.tags.length > 0 || note.priority !== "low" ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {due ? (
              <span className={cn("rounded-sm px-1.5 py-0.5 text-xs font-medium", TONE[due.tone])}>{due.label}</span>
            ) : null}
            {note.priority !== "low" ? (
              <span className={cn("rounded-sm px-1.5 py-0.5 text-xs font-medium capitalize", PRIORITY_TONE[note.priority])}>
                {note.priority} priority
              </span>
            ) : null}
            {note.tags.map((tag) => (
              <span key={tag} className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center">
        <IconButton
          label={note.pinned ? "Unpin" : "Pin"}
          icon={note.pinned ? PinOff : Pin}
          size="sm"
          aria-pressed={note.pinned}
          onClick={() => void patch({ pinned: !note.pinned })}
          className={cn(note.pinned && "text-primary-ink")}
        />
        <Menu label="Note actions" items={items} />
      </div>

      {editing ? <NoteEditDialog open note={note} onClose={() => setEditing(false)} /> : null}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void remove()}
        pending={pending}
        destructive
        title="Delete this note?"
        description={`"${note.title}" will be deleted from all your devices. This can't be undone.`}
        confirmLabel="Delete note"
      />
    </div>
  );
}
