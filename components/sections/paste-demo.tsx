"use client";

import { Laptop, Lock, Smartphone } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { KindIcon } from "@/components/ui/kind-badge";
import { Textarea } from "@/components/ui/textarea";
import type { ItemKind } from "@/lib/item-kinds";
import { titleFromText } from "@/lib/item-text";
import { displayHost } from "@/lib/safe-url";
import { announce } from "@/utils/announce";
import { cn } from "@/utils/cn";

/**
 * The landing page's try-it-yourself demo: paste (or type) anything into a
 * copy of Quick add, press Save, and it lands on "your other device" next to
 * it — with the app's arrival highlight and a Copy button that really copies.
 * On a phone the roles swap (this phone → your laptop).
 *
 * It runs entirely in this browser tab: nothing is sent, stored or logged.
 * The list keeps a fixed number of rows, so the page never jumps.
 */
interface DemoItem {
  id: number;
  kind: ItemKind;
  title: string;
  text: string;
  meta: string;
}

const MAX_ITEMS = 3;
const TRAVEL_MS = 650;
const HIGHLIGHT_MS = 1600;

const SAMPLES: ReadonlyArray<{ label: string; text: string }> = [
  {
    label: "an error",
    text: "TypeError: Cannot read properties of undefined (reading 'map')\n    at OrderList (OrderList.tsx:42:17)",
  },
  { label: "a link", text: "https://github.com/acme/checkout/pull/128" },
  { label: "a command", text: "docker compose up -d --build" },
];

const STARTING_ITEMS: DemoItem[] = [
  { id: -1, kind: "link", title: "github.com", text: "https://github.com/acme/checkout/issues/42", meta: "12 min ago" },
  { id: -2, kind: "text", title: "Wi-Fi: Office-5G", text: "Wi-Fi: Office-5G\nPassword is on the fridge", meta: "1 h ago" },
  {
    id: -3,
    kind: "command",
    title: "ssh deploy@10.0.4.12",
    text: "ssh deploy@10.0.4.12",
    meta: "Yesterday",
  },
];

/** A rough guess at the kind, the way the app files things (display only). */
function kindOf(text: string): ItemKind {
  const value = text.trim();
  if (/^https?:\/\/\S+$/i.test(value)) return "link";
  if (/\b(error|exception|traceback|failed)\b|\n\s+at\s/i.test(value)) return "error";
  if (/^(\$\s*)?(git|npm|npx|pnpm|yarn|docker|kubectl|cd|ls|curl|ssh|sudo|pip|python|node)\s/.test(value)) {
    return "command";
  }
  if (/[{};]\s*$/m.test(value) || /^\s*(const|let|function|import|export|def|class|SELECT)\b/m.test(value)) {
    return "code";
  }
  return "text";
}

function titleOf(text: string, kind: ItemKind): string {
  if (kind === "link") return displayHost(text) ?? text.trim();
  return titleFromText(text, "Empty").title;
}

export function PasteDemo() {
  const inputId = useId();
  const noteId = useId();
  const [text, setText] = useState("");
  const [items, setItems] = useState<DemoItem[]>(STARTING_ITEMS);
  const [sending, setSending] = useState(false);
  const [arrivedId, setArrivedId] = useState<number | null>(null);
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

  function send(value: string) {
    if (sending || value.trim().length === 0) return;
    setSending(true);
    const id = nextId.current;
    nextId.current += 1;
    const kind = kindOf(value);
    const item: DemoItem = { id, kind, title: titleOf(value, kind), text: value, meta: "Just now" };

    later(() => {
      setItems((list) => [item, ...list].slice(0, MAX_ITEMS));
      setArrivedId(id);
      setSending(false);
      setDelivered(true);
      setText("");
      announce("It's on your other device");
      later(() => setArrivedId((current) => (current === id ? null : current)), HIGHLIGHT_MS);
    }, TRAVEL_MS);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      send(text);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_17.5rem] md:items-start lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10">
        {/* This device: Quick add, as it looks in the app. */}
        <div className="flex min-w-0 flex-col gap-2">
          <DeviceLabel>
            <span className="hidden items-center gap-1.5 md:flex">
              <Laptop className="size-4" aria-hidden="true" />
              This computer
            </span>
            <span className="flex items-center gap-1.5 md:hidden">
              <Smartphone className="size-4" aria-hidden="true" />
              This phone
            </span>
          </DeviceLabel>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:p-5">
            <label htmlFor={inputId} className="text-sm font-semibold">
              Quick add
            </label>
            <Textarea
              id={inputId}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              maxLength={4000}
              placeholder="Paste or type anything…"
              spellCheck={false}
              aria-describedby={noteId}
              className="resize-none"
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
                      send(sample.text);
                    }}
                    disabled={sending}
                    className="inline-flex h-8 items-center rounded-full border border-border px-3 text-sm text-foreground transition-colors duration-fast hover:bg-accent active:bg-accent disabled:opacity-50 pointer-coarse:h-11 pointer-coarse:px-4"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                onClick={() => send(text)}
                disabled={text.trim().length === 0}
                loading={sending}
                className="shrink-0"
              >
                {sending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {/* The other device: a phone from md up; on a phone, your laptop. */}
        <div className="flex min-w-0 flex-col gap-2">
          <DeviceLabel>
            <span className="hidden items-center gap-1.5 md:flex">
              <Smartphone className="size-4" aria-hidden="true" />
              Your phone
            </span>
            <span className="flex items-center gap-1.5 md:hidden">
              <Laptop className="size-4" aria-hidden="true" />
              Your laptop
            </span>
          </DeviceLabel>
          <div className="rounded-xl border border-border bg-surface-2 p-1.5 md:rounded-[1.75rem] md:p-2">
            <div className="overflow-hidden rounded-lg bg-background md:rounded-[1.3rem]">
              <div className="flex h-11 items-center justify-between gap-2 border-b border-border px-3.5">
                <span className="text-sm font-semibold">Snippets</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                  Live
                </span>
              </div>
              <ul aria-label="On your other device" className="flex flex-col gap-2 p-2">
                {items.map((item) => (
                  <li key={item.id} data-arrived={arrivedId === item.id ? "true" : undefined}>
                    <div className="flex min-w-0 items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2">
                      <KindIcon kind={item.kind} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.meta}</p>
                      </div>
                      <CopyButton value={item.text} iconOnly variant="ghost" srContext={item.title} className="shrink-0" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p aria-hidden="true" className={cn("text-foreground", !delivered && "text-muted-foreground")}>
          {delivered ? (
            <>
              <span className="hidden md:inline">It&apos;s on your phone. </span>
              <span className="md:hidden">It&apos;s on your laptop. </span>
              Tap Copy there and paste it anywhere.
            </>
          ) : (
            "Paste something into Quick add and press Save."
          )}
        </p>
        <p id={noteId} className="flex items-center gap-1.5">
          <Lock className="size-3.5 shrink-0" aria-hidden="true" />
          This demo runs only in your browser. Nothing you paste here is sent anywhere.
        </p>
      </div>
    </div>
  );
}

function DeviceLabel({ children }: { children: ReactNode }) {
  return <div className="text-sm font-medium text-muted-foreground">{children}</div>;
}
