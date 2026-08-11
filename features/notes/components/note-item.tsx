"use client";

import { Archive, ArchiveRestore, Check, Pencil, Pin, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { deleteNoteAction, patchNoteAction } from "@/features/notes/actions";
import { NoteEditDialog } from "@/features/notes/components/note-edit-dialog";
import { dueMeta, PRIORITY_TONE } from "@/features/notes/note-utils";
import type { Note } from "@/features/notes/types";
import { cn } from "@/utils/cn";

const TONE: Record<"overdue" | "today" | "upcoming", string> = {
  overdue: "text-red-500 bg-red-500/10",
  today: "text-brand bg-brand/10",
  upcoming: "text-muted-foreground bg-muted",
};

function IconButton({
  label,
  onClick,
  children,
  active,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "text-brand",
      )}
    >
      {children}
    </button>
  );
}

export function NoteItem({ note }: { note: Note }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
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
    if (!window.confirm("Delete this note permanently? This cannot be undone.")) return;
    setPending(true);
    const result = await deleteNoteAction(note.id);
    setPending(false);
    if (!result.ok) toast.error(result.error.message);
    else {
      toast.success("Note deleted");
      router.refresh();
    }
  }

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors",
        pending && "opacity-60",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
        onClick={() => void patch({ status: completed ? "pending" : "completed" })}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          completed ? "border-brand bg-brand text-brand-foreground" : "border-input hover:border-brand",
        )}
      >
        {completed ? <Check className="size-3" aria-hidden="true" /> : null}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", completed && "text-muted-foreground line-through")}>
          {note.title}
        </p>
        {note.content ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{note.content}</p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {due ? (
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", TONE[due.tone])}>
              {due.label}
            </span>
          ) : null}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
              PRIORITY_TONE[note.priority],
            )}
          >
            {note.priority}
          </span>
          {note.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        <IconButton
          label={note.pinned ? "Unpin" : "Pin"}
          active={note.pinned}
          onClick={() => void patch({ pinned: !note.pinned })}
        >
          <Pin className="size-4" aria-hidden="true" />
        </IconButton>
        <IconButton label="Edit" onClick={() => setEditing(true)}>
          <Pencil className="size-4" aria-hidden="true" />
        </IconButton>
        <IconButton
          label={note.archived ? "Restore" : "Archive"}
          onClick={() => void patch({ archived: !note.archived })}
        >
          {note.archived ? (
            <ArchiveRestore className="size-4" aria-hidden="true" />
          ) : (
            <Archive className="size-4" aria-hidden="true" />
          )}
        </IconButton>
        <IconButton label="Delete" onClick={() => void remove()}>
          <Trash2 className="size-4" aria-hidden="true" />
        </IconButton>
      </div>

      {editing ? <NoteEditDialog open note={note} onClose={() => setEditing(false)} /> : null}
    </li>
  );
}
