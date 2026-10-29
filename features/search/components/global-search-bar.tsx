"use client";

import { Search } from "lucide-react";
import { useSyncExternalStore } from "react";

import { useSearchModal } from "@/features/search/search-provider";
import { cn } from "@/utils/cn";

const noSubscribe = () => () => {};

/** "⌘K" on Apple devices, "Ctrl K" elsewhere; nothing until the browser can tell (no hydration mismatch). */
function useShortcutLabel(): string | null {
  return useSyncExternalStore(
    noSubscribe,
    () => (/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "⌘K" : "Ctrl K"),
    () => null,
  );
}

/**
 * GlobalSearchBar — the top-bar search trigger. Renders as a styled button (a
 * real input lives inside the modal). Full pill from lg (where the top bar has
 * room next to the breadcrumbs); icon-only below. Opens the command palette.
 */
export function GlobalSearchBar({ className }: { className?: string }) {
  const { open } = useSearchModal();
  const shortcut = useShortcutLabel();

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Search"
        aria-keyshortcuts="Meta+K Control+K"
        className={cn(
          "hidden h-9 w-48 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors duration-fast hover:bg-accent lg:flex xl:w-64",
          className,
        )}
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">Search…</span>
        {shortcut ? (
          <kbd className="pointer-events-none rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
            {shortcut}
          </kbd>
        ) : null}
      </button>

      <button
        type="button"
        onClick={open}
        aria-label="Search"
        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-fast hover:bg-accent hover:text-accent-foreground active:bg-accent pointer-coarse:size-11 lg:hidden"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>
    </>
  );
}
