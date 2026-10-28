"use client";

import { Check, Copy, Laptop, RotateCcw, Smartphone } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { KindIcon } from "@/components/ui/kind-badge";
import type { ItemKind } from "@/lib/item-kinds";
import { cn } from "@/utils/cn";

/**
 * The hero's proof, played once: an error pasted on a work laptop is saved,
 * shows up on a phone a second later with the app's "arrived" highlight, and
 * is copied there. It starts when it comes into view, finishes in under five
 * seconds and stops (then offers Replay). With reduced motion it simply shows
 * the finished state. Every slot is reserved up front, so nothing on the page
 * moves while it plays. The pictures are decorative; the caption tells the
 * same story to screen readers.
 */
type Step = "idle" | "pasted" | "saved" | "synced" | "copied";

const ORDER: readonly Step[] = ["idle", "pasted", "saved", "synced", "copied"];

const TIMELINE: ReadonlyArray<{ step: Step; at: number }> = [
  { step: "pasted", at: 600 },
  { step: "saved", at: 1500 },
  { step: "synced", at: 2300 },
  { step: "copied", at: 3400 },
];
const DONE_AT = 4200;

const CAPTIONS: Record<Step, string> = {
  idle: "Copy something on your laptop…",
  pasted: "Paste it into CopyAnywhere…",
  saved: "Save it…",
  synced: "It's on your phone.",
  copied: "Tap Copy and paste it anywhere.",
};

const ERROR_TITLE = "TypeError: Cannot read properties of undefined (reading 'map')";
const ERROR_TEXT = `${ERROR_TITLE}\n    at OrderList (OrderList.tsx:42:17)`;

function reached(current: Step, target: Step): boolean {
  return ORDER.indexOf(current) >= ORDER.indexOf(target);
}

export function SyncDemo() {
  const rootRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState<Step>("idle");
  /** Bumped to (re)start the sequence; 0 = not started yet. */
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  /** Replay stays on screen once it has appeared, so keyboard focus is never lost. */
  const [played, setPlayed] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Reduced motion: show the end. Otherwise play once, when the demo is on screen.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setStep("copied");
      setDone(true);
      return;
    }
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setRun(1);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRun(1);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (run === 0) return;
    setStep("idle");
    setDone(false);
    const timers = TIMELINE.map(({ step: next, at }) => window.setTimeout(() => setStep(next), at));
    timers.push(
      window.setTimeout(() => {
        setDone(true);
        setPlayed(true);
      }, DONE_AT),
    );
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [run]);

  const pasted = step === "pasted";
  const saved = reached(step, "saved");
  const synced = reached(step, "synced");
  const copied = step === "copied";

  return (
    <figure ref={rootRef} className="flex min-w-0 flex-col gap-4">
      <div aria-hidden="true" className="grid items-end gap-6 sm:grid-cols-[minmax(0,1fr)_13.5rem]">
        {/* Work laptop: CopyAnywhere in a browser window. */}
        <div className="flex min-w-0 flex-col gap-2">
          <DeviceLabel icon={<Laptop className="size-3.5" />}>Work laptop, in the browser</DeviceLabel>
          <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
            <div className="flex h-9 items-center justify-between gap-2 border-b border-border bg-surface-2 px-3">
              <span className="text-xs font-medium text-foreground">CopyAnywhere</span>
              <span className="text-xs text-muted-foreground">Nothing installed</span>
            </div>
            <div className="flex flex-col gap-3 p-3 sm:p-4">
              <div
                className={cn(
                  "h-24 overflow-hidden rounded-md border bg-background px-2.5 py-2 transition-colors duration-base",
                  pasted ? "border-ring" : "border-input",
                )}
              >
                {pasted ? (
                  <span className="block whitespace-pre-wrap font-mono text-xs leading-5 text-foreground [overflow-wrap:anywhere]">
                    {ERROR_TEXT}
                  </span>
                ) : (
                  <span className="text-xs leading-5 text-muted-foreground">Paste anything…</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Quick add</span>
                <span
                  className={cn(
                    "inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-transform duration-fast",
                    step === "saved" && "scale-95",
                  )}
                >
                  Save
                </span>
              </div>
              <div className="hidden flex-col gap-1.5 sm:flex">
                <span className="text-xs font-medium text-muted-foreground">Recent</span>
                <div className={cn(saved ? "animate-arrive" : "invisible")}>
                  <DemoItem kind="error" title={ERROR_TITLE} meta="Just now" />
                </div>
                <DemoItem kind="image" title="IMG_2041.jpg" meta="From your phone · 12 min ago" />
              </div>
            </div>
          </div>
        </div>

        {/* Phone: the same account, signed in. */}
        <div className="mx-auto flex w-[13.5rem] flex-col gap-2 sm:mx-0">
          <DeviceLabel icon={<Smartphone className="size-3.5" />}>Your phone</DeviceLabel>
          <div className="rounded-2xl border-2 border-border bg-surface-2 p-1.5">
            <div className="flex h-[15.5rem] flex-col overflow-hidden rounded-lg bg-background sm:h-[19.5rem]">
              <div className="flex h-10 shrink-0 items-center border-b border-border px-3">
                <span className="text-sm font-semibold text-foreground">Snippets</span>
              </div>
              <div className="flex flex-col gap-2 p-2">
                <div
                  className={cn("rounded-md", synced ? undefined : "invisible")}
                  data-arrived={synced && !reduced ? "true" : undefined}
                >
                  <DemoItem
                    kind="error"
                    title={ERROR_TITLE}
                    meta="Just now · from your laptop"
                    action={
                      <span
                        className={cn(
                          "inline-flex h-7 w-[4.75rem] shrink-0 items-center justify-center gap-1 rounded-md border text-xs font-medium",
                          copied
                            ? "border-transparent bg-wash text-primary-ink"
                            : "border-border bg-surface text-foreground",
                        )}
                      >
                        {copied ? (
                          <Check className={cn("size-3.5", !reduced && "animate-pop")} />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </span>
                    }
                  />
                </div>
                <DemoItem kind="image" title="IMG_2041.jpg" meta="12 min ago" />
                <DemoItem kind="link" title="github.com" meta="1 h ago" />
                <div className="hidden sm:block">
                  <DemoItem kind="doc" title="Q3 report.pdf" meta="Yesterday" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="flex min-h-11 items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="sr-only">
            Example: an error pasted into CopyAnywhere on a work laptop shows up on a phone about a second later, ready
            to copy.
          </span>
          <span aria-hidden="true">{CAPTIONS[step]}</span>
        </p>
        {played && !reduced ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-disabled={!done || undefined}
            onClick={() => {
              if (done) setRun((count) => count + 1);
            }}
            className="shrink-0 aria-disabled:opacity-50"
          >
            <RotateCcw aria-hidden="true" />
            Replay
          </Button>
        ) : null}
      </figcaption>
    </figure>
  );
}

function DeviceLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}

function DemoItem({
  kind,
  title,
  meta,
  action,
}: {
  kind: ItemKind;
  title: string;
  meta: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-surface p-2">
      <KindIcon kind={kind} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      {action}
    </div>
  );
}
