"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { DISPLAY, EDGE } from "@/components/sections/landing-type";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Textarea } from "@/components/ui/textarea";
import { announce } from "@/utils/announce";
import { cn } from "@/utils/cn";

/**
 * The landing page's opening: a duplicate pad you can write on. Whatever is
 * saved on the white original presses through onto the pink copy under it
 * ("your other device"), where a Copy button really copies it. The page's
 * headline is printed across the two sheets.
 *
 * It runs entirely in this browser tab: nothing is sent, stored or logged.
 * The copy keeps a fixed number of lines, so the page never jumps.
 */
interface Entry {
  id: number;
  text: string;
  meta: string;
}

const MAX_ENTRIES = 3;
const TRAVEL_MS = 650;
const PRESS_MS = 900;

const SAMPLES: ReadonlyArray<{ label: string; text: string }> = [
  { label: "an address", text: "221B Baker Street, London NW1 6XE" },
  { label: "a link", text: "https://www.openstreetmap.org/#map=17/51.5237/-0.1585" },
  { label: "a shopping list", text: "Milk\nEggs\nCoffee\nLemons" },
];

const STARTING_ENTRIES: Entry[] = [
  { id: -1, text: "Wi-Fi: Office-5G\nPassword is on the fridge", meta: "12 min ago" },
  { id: -2, text: "https://github.com/acme/checkout/pull/128", meta: "1 h ago" },
  { id: -3, text: "Dentist, Thursday 9:30", meta: "Yesterday" },
];

export function DuplicatePad({ children }: { children: ReactNode }) {
  const inputId = useId();
  const noteId = useId();
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>(STARTING_ENTRIES);
  const [sending, setSending] = useState(false);
  const [pressedId, setPressedId] = useState<number | null>(null);
  const [delivered, setDelivered] = useState(false);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) window.clearTimeout(timer);
    };
  }, []);

  function later(callback: () => void, ms: number) {
    timers.current.push(window.setTimeout(callback, ms));
  }

  function save(value: string) {
    if (sending || value.trim().length === 0) return;
    setSending(true);
    const id = nextId.current;
    nextId.current += 1;

    later(() => {
      setEntries((list) => [{ id, text: value, meta: "Just now" }, ...list].slice(0, MAX_ENTRIES));
      setPressedId(id);
      setSending(false);
      setDelivered(true);
      setText("");
      announce("It's on your other device");
      later(() => setPressedId((current) => (current === id ? null : current)), PRESS_MS);
    }, TRAVEL_MS);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      save(text);
    }
  }

  return (
    <div className="grid gap-y-0 lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-6">
      {/* The original: this device. */}
      <div className="sheet-top relative z-10 flex min-w-0 flex-col rounded-[3px] shadow-sheet lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <div className="flex flex-1 flex-col gap-5 p-5 sm:p-8 lg:p-10">
          <h1 id="hero-title" className={DISPLAY}>
            Copy
            <br />
            here.<span className="sr-only"> Paste there.</span>
          </h1>

          <div className="flex flex-1 flex-col gap-3">
            <label htmlFor={inputId} className="sr-only">
              Write or paste anything
            </label>
            <Textarea
              id={inputId}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              maxLength={4000}
              placeholder="Write or paste anything…"
              spellCheck={false}
              aria-describedby={noteId}
              className="ruled min-h-28 flex-1 resize-none rounded-none border-0 bg-transparent px-0 py-0 font-typed text-lg md:text-lg"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Or try</span>
                {SAMPLES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setText(sample.text);
                      save(sample.text);
                    }}
                    disabled={sending}
                    className="inline-flex h-8 items-center rounded-[3px] border border-input px-3 text-sm transition-colors duration-fast hover:bg-accent active:bg-accent disabled:opacity-50 pointer-coarse:h-11 pointer-coarse:px-4"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                size="lg"
                onClick={() => save(text)}
                disabled={text.trim().length === 0}
                loading={sending}
                className="shrink-0"
              >
                {sending ? "Saving…" : "Save"}
              </Button>
            </div>
            <p id={noteId} className="text-sm text-muted-foreground">
              This runs only in your browser. Nothing you write here is sent anywhere.
            </p>
          </div>
        </div>

        <SheetEdge serial="No. 000128">
          White · original · <span className="hidden md:inline">this computer</span>
          <span className="md:hidden">this phone</span>
        </SheetEdge>
      </div>

      {/* Beside the pad: what this is, and the way in. */}
      <div className="order-last flex min-w-0 flex-col gap-6 pt-10 lg:order-none lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:pb-10 lg:pt-2">
        {children}
      </div>

      {/* The copy: the other device. Tucked under the original. */}
      <div className="sheet-pink relative -mt-2 ml-3 flex min-w-0 flex-col rounded-[3px] shadow-sheet sm:ml-8 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:-ml-20 lg:mt-0 lg:rotate-[1.1deg]">
        <div className="flex flex-col gap-4 p-5 pt-7 sm:p-8 lg:pb-8 lg:pl-28 lg:pr-8 lg:pt-8">
          <p aria-hidden="true" className={DISPLAY}>
            Paste
            <br />
            there.
          </p>

          <ul aria-label="On your other device" className="flex flex-col border-t border-border">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex h-[5.25rem] min-w-0 items-center gap-3 border-b border-border"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "line-clamp-2 whitespace-pre-wrap font-typed text-base leading-6 text-primary-ink [overflow-wrap:anywhere]",
                      pressedId === entry.id && "animate-press-through",
                    )}
                  >
                    {entry.text}
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.meta}</p>
                </div>
                <CopyButton
                  value={entry.text}
                  size="sm"
                  srContext={entry.text.split("\n")[0]}
                  className="shrink-0"
                />
              </li>
            ))}
          </ul>

          <p
            aria-hidden="true"
            className={cn("text-sm", delivered ? "font-semibold" : "text-muted-foreground")}
          >
            {delivered
              ? "It's on your other device. Press Copy and paste it anywhere."
              : "Press Save and watch this sheet."}
          </p>
        </div>

        <SheetEdge className="lg:pl-28 lg:pr-8">
          Pink · copy · <span className="hidden md:inline">your phone</span>
          <span className="md:hidden">your laptop</span>
        </SheetEdge>
      </div>
    </div>
  );
}

/** The line printed along the bottom of a form sheet: which copy it is, and its number. */
function SheetEdge({
  children,
  serial,
  className,
}: {
  children: ReactNode;
  serial?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-auto flex items-center justify-between gap-4 border-t border-dashed border-border px-5 py-3 sm:px-8 lg:px-10",
        className,
      )}
    >
      <p className={EDGE}>{children}</p>
      {serial ? (
        <p
          aria-hidden="true"
          className="shrink-0 whitespace-nowrap font-typed text-sm font-bold text-stamp"
        >
          {serial}
        </p>
      ) : null}
    </div>
  );
}
