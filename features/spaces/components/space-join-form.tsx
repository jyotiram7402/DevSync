"use client";

import { ClipboardPaste, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinSpaceAction } from "@/features/spaces/actions";
import { normalizeRoomCode } from "@/features/spaces/display";

/**
 * Join a room by its code. Accepts the code in any case, with spaces or
 * dashes, or a whole pasted invite link. Joining always takes a press of the
 * button, so opening a link alone never adds you to a room.
 */
export function SpaceJoinForm({ initialCode }: { initialCode: string }) {
  const router = useRouter();
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState(() => normalizeRoomCode(initialCode));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canPaste, setCanPaste] = useState(false);

  useEffect(() => {
    setCanPaste(typeof navigator.clipboard?.readText === "function");
  }, []);

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const value = normalizeRoomCode(code);
    setCode(value);
    if (value.length < 4) {
      setError("Enter the room code you were given.");
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    const result = await joinSpaceAction({ code: value });
    if (!result.ok) {
      setBusy(false);
      setError(result.error.message);
      inputRef.current?.focus();
      return;
    }
    toast.success(`You're in ${result.data.name}.`);
    router.push(`/dashboard/spaces/${result.data.id}`);
    // The sidebar lists rooms by name; refresh it too.
    router.refresh();
  }

  async function paste() {
    try {
      const value = normalizeRoomCode(await navigator.clipboard.readText());
      if (value.length === 0) {
        toast.error("There's no code on the clipboard.");
        return;
      }
      setCode(value);
      setError(null);
    } catch {
      toast.error("Couldn't read the clipboard. Long-press the box and tap Paste.");
    }
  }

  return (
    <form onSubmit={(event) => void join(event)} noValidate className="flex flex-col gap-3">
      <Label htmlFor={inputId}>Room code</Label>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id={inputId}
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            if (error) setError(null);
          }}
          onBlur={() => setCode((current) => normalizeRoomCode(current))}
          placeholder="ABCDE12345"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={200}
          aria-invalid={error ? true : undefined}
          aria-describedby={hintId}
          className="h-12 font-mono text-lg tracking-[0.15em] pointer-coarse:h-12 md:text-lg"
        />
        {canPaste ? (
          <Button type="button" variant="outline" onClick={() => void paste()} className="h-12 shrink-0 pointer-coarse:h-12">
            <ClipboardPaste aria-hidden="true" />
            Paste
          </Button>
        ) : null}
      </div>
      <p id={hintId} className={error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
        {error ?? "Letters and numbers, like ABCDE12345. You can also paste the whole invite link."}
      </p>
      <Button type="submit" size="lg" loading={busy} className="w-full">
        {busy ? null : <LogIn aria-hidden="true" />}
        Join room
      </Button>
    </form>
  );
}
