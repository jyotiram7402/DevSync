"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { KIND_ICONS, KIND_TONE_TEXT } from "@/components/ui/kind-badge";
import { ITEM_KINDS, type ItemKind } from "@/lib/item-kinds";
import { cn } from "@/utils/cn";

/**
 * AuthBackdrop — the sign-in screens' background: slow columns of the things
 * people copy between devices (an error, a command, a link, a file) drifting
 * up like a feed that's syncing. Every few seconds one item gets the selection
 * wash — the app's "just copied" moment.
 *
 * Decorative only (hidden from screen readers, no pointer events). It has a
 * pause button, as moving content must (WCAG 2.2.2), remembered on this
 * device, and it stands still when the system asks for reduced motion.
 */
interface StreamItem {
  kind: ItemKind;
  text: string;
  /** Lights up with the wash; the class sets when in the 14s cycle (`--wash-delay`). */
  wash?: string;
}

interface Stream {
  items: ReadonlyArray<StreamItem>;
  /** Visibility per breakpoint, speed and start offset (full class names for Tailwind). */
  className: string;
}

const STREAMS: ReadonlyArray<Stream> = [
  {
    className: "flex [--stream-delay:-8s] [--stream-duration:64s]",
    items: [
      { kind: "error", text: "TypeError: Cannot read properties of undefined", wash: "[--wash-delay:0s]" },
      { kind: "link", text: "vercel.com/docs/deployments" },
      { kind: "command", text: "git push origin main" },
      { kind: "image", text: "screenshot-2026-10-28.png" },
      { kind: "code", text: "const user = await getUser()" },
      { kind: "doc", text: "release-notes.pdf" },
    ],
  },
  {
    className: "flex [--stream-delay:-30s] [--stream-duration:52s]",
    items: [
      { kind: "command", text: "npm run build" },
      { kind: "note", text: "Call the bank before 5pm" },
      { kind: "link", text: "github.com/pulls" },
      { kind: "error", text: "ECONNREFUSED 127.0.0.1:5432", wash: "[--wash-delay:7s]" },
      { kind: "archive", text: "logs-export.zip" },
      { kind: "code", text: "SELECT * FROM snippets LIMIT 10;" },
    ],
  },
  {
    className: "hidden sm:flex [--stream-delay:-17s] [--stream-duration:70s]",
    items: [
      { kind: "text", text: "Meeting moved to 3:30" },
      { kind: "error", text: "Gradle build failed: SDK not found" },
      { kind: "image", text: "whiteboard.jpg", wash: "[--wash-delay:3.5s]" },
      { kind: "command", text: "adb logcat *:E" },
      { kind: "link", text: "supabase.com/dashboard" },
      { kind: "doc", text: "invoice-october.pdf" },
    ],
  },
  {
    className: "hidden lg:flex [--stream-delay:-41s] [--stream-duration:58s]",
    items: [
      { kind: "code", text: "export default function Page() {" },
      { kind: "text", text: "Pick up keys from reception" },
      { kind: "error", text: "404 Not Found: /api/sync" },
      { kind: "video", text: "demo-recording.mov" },
      { kind: "command", text: "docker compose up -d", wash: "[--wash-delay:10.5s]" },
      { kind: "link", text: "figma.com/file/redesign" },
    ],
  },
  {
    className: "hidden lg:flex [--stream-delay:-5s] [--stream-duration:66s]",
    items: [
      { kind: "note", text: "Renew the domain next week" },
      { kind: "command", text: "kubectl get pods" },
      { kind: "image", text: "receipt.png" },
      { kind: "error", text: "ReferenceError: process is not defined" },
      { kind: "code", text: "useEffect(() => sync(), [])", wash: "[--wash-delay:12s]" },
      { kind: "doc", text: "team-roster.xlsx" },
    ],
  },
];

/** Each column repeats its items this many times; the `stream` keyframes move it up by one copy. */
const COPIES = 6;

const STORAGE_KEY = "copyanywhere:auth-backdrop";

function StreamChip({ item, index }: { item: StreamItem; index: number }) {
  const Icon = KIND_ICONS[item.kind];
  const tone = ITEM_KINDS[item.kind].tone;

  return (
    // Bottom padding instead of a flex gap keeps every copy exactly the same height (seamless loop).
    <div className={cn("flex pb-4", index % 3 === 1 ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted-foreground",
          item.wash !== undefined && ["animate-wash-loop", item.wash],
        )}
      >
        <Icon className={cn("size-4 shrink-0", KIND_TONE_TEXT[tone])} aria-hidden="true" />
        <span className="truncate">{item.text}</span>
      </div>
    </div>
  );
}

export function AuthBackdrop() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "paused") setPaused(true);
    } catch {
      // Storage can be blocked (private mode, policies): the animation just plays.
    }
  }, []);

  function toggle() {
    const next = !paused;
    setPaused(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "paused" : "playing");
    } catch {
      // Not remembered this time; the button still works.
    }
  }

  return (
    <>
      <div
        aria-hidden="true"
        data-motion={paused ? "paused" : "running"}
        className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden opacity-70 [mask-image:radial-gradient(ellipse_at_center,rgb(0_0_0/0.15)_0%,black_70%)] dark:opacity-60"
      >
        <div className="grid h-full grid-cols-2 gap-4 px-4 sm:grid-cols-3 lg:grid-cols-5">
          {STREAMS.map((stream, column) => (
            <div
              key={column}
              className={cn(
                "min-w-0 flex-col self-start animate-stream will-change-transform",
                stream.className,
              )}
            >
              {Array.from({ length: COPIES }).flatMap((_, copy) =>
                stream.items.map((item, index) => (
                  <StreamChip key={`${copy}-${index}`} item={item} index={index} />
                )),
              )}
            </div>
          ))}
        </div>
      </div>

      <IconButton
        label="Pause background animation"
        icon={paused ? Play : Pause}
        aria-pressed={paused}
        variant="outline"
        size="sm"
        onClick={toggle}
        // In the page's bottom padding, so it never covers the form on small phones.
        className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 motion-reduce:hidden"
      />
    </>
  );
}
