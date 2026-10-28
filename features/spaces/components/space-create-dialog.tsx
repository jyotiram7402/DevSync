"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { DialogFooter, ResponsiveDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSpaceAction } from "@/features/spaces/actions";

/** "New room" button and its dialog: name the room, create it, land inside. */
export function SpaceCreateButton() {
  const router = useRouter();
  const formId = useId();
  const inputId = useId();
  const hintId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    if (busy) return;
    setOpen(false);
    setName("");
    setError(null);
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await createSpaceAction({ name: name.trim() });
    if (!result.ok) {
      setBusy(false);
      setError(result.error.message);
      return;
    }
    router.push(`/dashboard/spaces/${result.data.id}`);
    // The sidebar lists rooms by name; refresh it too.
    router.refresh();
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        New room
      </Button>

      <ResponsiveDialog
        open={open}
        onClose={close}
        title="New room"
        description="One room per project. Everything shared in it shows up for everyone in it, live."
        size="sm"
        footer={
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={busy}>
              Create room
            </Button>
          </DialogFooter>
        }
      >
        <form id={formId} onSubmit={(event) => void create(event)} className="flex flex-col gap-2">
          <Label htmlFor={inputId}>Room name</Label>
          <Input
            id={inputId}
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. GeoReminder Android"
            maxLength={80}
            autoComplete="off"
            enterKeyHint="done"
            aria-invalid={error ? true : undefined}
            aria-describedby={hintId}
          />
          <p id={hintId} className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
            {error ?? "Name it after the project, so everyone knows where they are."}
          </p>
        </form>
      </ResponsiveDialog>
    </>
  );
}
