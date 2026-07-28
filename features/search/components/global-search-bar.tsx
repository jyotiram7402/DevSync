"use client";

import { Search } from "lucide-react";

import { useSearchModal } from "@/features/search/search-provider";
import { cn } from "@/utils/cn";

/**
 * GlobalSearchBar — the top-bar search trigger. Renders as a styled button (a
 * real input lives inside the modal). Full pill on wider viewports; icon-only
 * on mobile. Opens the command palette.
 */
export function GlobalSearchBar({ className }: { className?: string }) {
  const { open } = useSearchModal();

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Search"
        aria-keyshortcuts="Meta+K Control+K"
        className={cn(
          "hidden h-9 w-64 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex",
          className,
        )}
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="pointer-events-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={open}
        aria-label="Search"
        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>
    </>
  );
}
