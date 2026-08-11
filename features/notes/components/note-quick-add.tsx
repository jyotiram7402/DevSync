"use client";

import { CalendarClock, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { quickCreateNoteAction } from "@/features/notes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

/**
 * Extremely fast note capture: type a title, hit Enter, done. Optional due
 * date/time behind a toggle so the common case stays one field. Optimistic-ish
 * via router.refresh on success (matches the app's server-first pattern).
 */
export function NoteQuickAdd({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [showDue, setShowDue] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        <div className="flex h-10 flex-1 items-center gap-2 rounded-md border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
          <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a note…  (e.g. Fix the production bug tomorrow)"
            aria-label="Note title"
            autoFocus={autoFocus}
            className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setShowDue((v) => !v)}
            aria-label="Add due date"
            aria-pressed={showDue}
            className={cn(
              "rounded p-1 text-muted-foreground transition-colors hover:text-foreground",
              showDue && "text-brand",
            )}
          >
            <CalendarClock className="size-4" aria-hidden="true" />
          </button>
        </div>
        <Button type="submit" disabled={busy || title.trim().length === 0} aria-busy={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Add"}
        </Button>
      </div>

      {showDue ? (
        <div className="flex gap-2">
          <Input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            aria-label="Due date"
            className="h-9"
          />
          <Input
            type="time"
            value={dueTime}
            onChange={(event) => setDueTime(event.target.value)}
            aria-label="Due time"
            className="h-9 w-32"
          />
        </div>
      ) : null}
    </form>
  );
}
