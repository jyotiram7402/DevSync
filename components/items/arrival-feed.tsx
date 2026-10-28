"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { announce } from "@/utils/announce";
import { cn } from "@/utils/cn";

/**
 * ArrivalFeed — a list that notices items arriving from another device.
 *
 * When live updates re-render the list (router.refresh()), entries whose ids
 * weren't there before slide in with the selection wash (the app's signature
 * moment), and screen readers hear "1 new item". If you have scrolled away,
 * your position is kept and a "1 new item" pill takes you back up. Browsers
 * with CSS scroll anchoring keep the position themselves; elsewhere (Safari)
 * the feed scrolls by however far the entry you were looking at moved, before
 * the frame is painted. Changing `resetKey` (a new filter, search or page)
 * makes the next list a fresh start rather than "arrivals".
 */
export interface FeedEntry {
  id: string;
  node: ReactNode;
}

/** How far down the page counts as "scrolled away". */
const SCROLLED_AWAY_PX = 240;
const HIGHLIGHT_MS = 1600;

/** The first entry at least partly on screen, and where its top edge is. */
function firstVisibleEntry(list: HTMLElement): { id: string; top: number } | null {
  for (const child of Array.from(list.children)) {
    if (!(child instanceof HTMLElement)) continue;
    const rect = child.getBoundingClientRect();
    if (rect.bottom > 0) return { id: child.dataset.entryId ?? "", top: rect.top };
  }
  return null;
}

export function ArrivalFeed({
  entries,
  label,
  resetKey = "",
  className,
  pillClassName,
}: {
  entries: ReadonlyArray<FeedEntry>;
  /** Accessible name of the list, e.g. "Snippets". */
  label: string;
  resetKey?: string;
  className?: string;
  /** Moves the "new items" pill, e.g. below a sticky filter row. */
  pillClassName?: string;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const seen = useRef<{ key: string; ids: Set<string> } | null>(null);
  /** Set only where the browser doesn't anchor the scroll position itself. */
  const anchor = useRef<{ id: string; top: number } | null>(null);
  const manualAnchoring = useRef(false);
  const [arrived, setArrived] = useState<ReadonlySet<string>>(() => new Set());
  const [waiting, setWaiting] = useState(0);
  const idsKey = entries.map((entry) => entry.id).join("|");

  // No CSS scroll anchoring: keep track of the entry in view while scrolled away.
  useEffect(() => {
    if (typeof CSS === "undefined" || CSS.supports("overflow-anchor", "auto")) return;
    manualAnchoring.current = true;
    let frame = 0;
    function record() {
      frame = 0;
      const list = listRef.current;
      anchor.current = list && window.scrollY > SCROLLED_AWAY_PX ? firstVisibleEntry(list) : null;
    }
    function handleScroll() {
      if (frame === 0) frame = window.requestAnimationFrame(record);
    }
    record();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // …and when the list changes, put that entry back where it was on screen.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!manualAnchoring.current || !list) return;
    const saved = anchor.current;
    if (saved) {
      const entry = Array.from(list.children).find(
        (child): child is HTMLElement => child instanceof HTMLElement && child.dataset.entryId === saved.id,
      );
      const moved = entry ? entry.getBoundingClientRect().top - saved.top : 0;
      if (Math.abs(moved) >= 1) window.scrollBy(0, moved);
    }
    anchor.current = window.scrollY > SCROLLED_AWAY_PX ? firstVisibleEntry(list) : null;
  }, [idsKey]);

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

  function showNewItems() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    setWaiting(0);
  }

  return (
    <>
      {waiting > 0 ? (
        <button
          type="button"
          onClick={showNewItems}
          className={cn(
            // Centered with auto margins, not a transform: the arrive animation animates transform.
            "fixed inset-x-0 top-[calc(env(safe-area-inset-top,0px)_+_4.5rem)] z-sticky mx-auto flex h-9 w-fit items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-overlay animate-arrive pointer-coarse:h-11",
            pillClassName,
          )}
        >
          <ArrowUp className="size-4" aria-hidden="true" />
          {waiting === 1 ? "1 new item" : `${waiting} new items`}
        </button>
      ) : null}

      <ul ref={listRef} aria-label={label} className={cn("flex flex-col gap-2", className)}>
        {entries.map((entry) => (
          <li
            key={entry.id}
            data-entry-id={entry.id}
            data-arrived={arrived.has(entry.id) ? "true" : undefined}
            className="min-w-0"
          >
            {entry.node}
          </li>
        ))}
      </ul>
    </>
  );
}
