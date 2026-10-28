"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { announce } from "@/utils/announce";
import { cn } from "@/utils/cn";

/**
 * ArrivalFeed — a list that notices items arriving from another device.
 *
 * When live updates re-render the list (router.refresh()), entries whose ids
 * weren't there before slide in with the selection wash (the app's signature
 * moment), and screen readers hear "1 new item". If you have scrolled away,
 * your position is kept (the browser anchors the scroll) and a "1 new item"
 * pill takes you back up. Changing `resetKey` (a new filter, search or page)
 * makes the next list a fresh start rather than "arrivals".
 */
export interface FeedEntry {
  id: string;
  node: ReactNode;
}

/** How far down the page counts as "scrolled away". */
const SCROLLED_AWAY_PX = 240;
const HIGHLIGHT_MS = 1600;

export function ArrivalFeed({
  entries,
  label,
  resetKey = "",
  className,
}: {
  entries: ReadonlyArray<FeedEntry>;
  /** Accessible name of the list, e.g. "Snippets". */
  label: string;
  resetKey?: string;
  className?: string;
}) {
  const seen = useRef<{ key: string; ids: Set<string> } | null>(null);
  const [arrived, setArrived] = useState<ReadonlySet<string>>(() => new Set());
  const [waiting, setWaiting] = useState(0);
  const idsKey = entries.map((entry) => entry.id).join("|");

  useEffect(() => {
    const ids = new Set(idsKey ? idsKey.split("|") : []);
    const previous = seen.current;
    seen.current = { key: resetKey, ids };
    if (!previous || previous.key !== resetKey) return;

    const fresh = [...ids].filter((id) => !previous.ids.has(id));
    if (fresh.length === 0) return;

    setArrived(new Set(fresh));
    announce(fresh.length === 1 ? "1 new item" : `${fresh.length} new items`);
    if (window.scrollY > SCROLLED_AWAY_PX) setWaiting((count) => count + fresh.length);

    const timer = window.setTimeout(() => setArrived(new Set()), HIGHLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [idsKey, resetKey]);

  // Back near the top: the new items are in view, so the pill goes away.
  useEffect(() => {
    if (waiting === 0) return;
    function handleScroll() {
      if (window.scrollY <= SCROLLED_AWAY_PX) setWaiting(0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [waiting]);

  return (
    <>
      {waiting > 0 ? (
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setWaiting(0);
          }}
          className="fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)_+_4.5rem)] z-sticky flex h-9 -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-overlay animate-arrive pointer-coarse:h-11"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
          {waiting === 1 ? "1 new item" : `${waiting} new items`}
        </button>
      ) : null}

      <ul aria-label={label} className={cn("flex flex-col gap-2", className)}>
        {entries.map((entry) => (
          <li key={entry.id} data-arrived={arrived.has(entry.id) ? "true" : undefined} className="min-w-0">
            {entry.node}
          </li>
        ))}
      </ul>
    </>
  );
}
