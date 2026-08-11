"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { createNoteAction, updateNoteAction } from "@/features/notes/actions";
import type { NoteFormValues } from "@/features/notes/schemas";
import type { Note, NotePriority } from "@/features/notes/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/** Create (no `note`) or edit a note with the full field set. */
export function NoteEditDialog({
  open,
  onClose,
  note,
}: {
  open: boolean;
  onClose: () => void;
  note?: Note;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [priority, setPriority] = useState<NotePriority>(note?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(note?.dueDate ?? "");
  const [dueTime, setDueTime] = useState(note?.dueTime ?? "");
  const [tags, setTags] = useState((note?.tags ?? []).join(", "));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const values: NoteFormValues = {
      title: title.trim(),
      content: content.trim(),
      priority,
      dueDate,
      dueTime,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    };
    const result = note
      ? await updateNoteAction(note.id, values)
      : await createNoteAction(values);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success(note ? "Note updated" : "Note created");
    onClose();
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={note ? "Edit note" : "New note"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note-content">Details</Label>
          <Textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Optional"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-priority">Priority</Label>
            <select
              id="note-priority"
              className={selectClass}
              value={priority}
              onChange={(e) => setPriority(e.target.value as NotePriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-date">Due date</Label>
            <Input
              id="note-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-time">Due time</Label>
            <Input
              id="note-time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note-tags">Tags</Label>
          <Input
            id="note-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="work, urgent (comma separated)"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy} aria-busy={busy}>
            {busy ? "Saving…" : note ? "Save changes" : "Create note"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
