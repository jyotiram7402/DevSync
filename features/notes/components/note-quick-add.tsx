"use client";

import { CalendarClock, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { quickCreateNoteAction } from "@/features/notes/actions";
import { cn } from "@/utils/cn";

/**
 * Fast note capture: type a title, press Enter, done. An optional due date and
 * time sit behind the calendar button so the common case stays one field.
 * `autoFocus` only applies with a mouse/trackpad — on phones it would throw
 * the keyboard up on every visit.
 */
export function NoteQuickAdd({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [showDue, setShowDue] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, [autoFocus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length === 0 || busy) return;
    setBusy(true);
    const result = await quickCreateNoteAction({
      title: title.trim(),
      ...(dueDate ? { dueDate } : {}),
      ...(dueTime ? { dueTime } : {}),
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setTitle("");
    setDueDate("");
    setDueTime("");
    setShowDue(false);
    router.refresh();
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-surface pl-3 transition-colors duration-fast focus-within:border-ring focus-within:outline focus-within:outline-2 focus-within:outline-ring pointer-coarse:h-11">
          <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a note, like “Renew the domain on Friday”"
            aria-label="New note"
            enterKeyHint="done"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
          />
          <IconButton
            label="Add a due date"
            icon={CalendarClock}
            size="sm"
            aria-pressed={showDue}
            onClick={() => setShowDue((value) => !value)}
            className={cn("shrink-0", showDue && "text-primary-ink")}
          />
        </div>
        <Button type="submit" disabled={title.trim().length === 0} loading={busy}>
          Add
        </Button>
      </div>

      {showDue ? (
        <div className="flex gap-2">
          <Input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            aria-label="Due date"
          />
          <Input
            type="time"
            value={dueTime}
            onChange={(event) => setDueTime(event.target.value)}
            aria-label="Due time"
            className="w-36"
          />
        </div>
      ) : null}
    </form>
  );
}
