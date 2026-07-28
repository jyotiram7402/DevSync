"use client";

import { Search } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/utils/cn";

/**
 * Global search field (UI only). Styled as an input but implemented as a
 * button that would open the command palette — the actual search/palette lands
 * in a later sprint. Shows a placeholder toast for now.
 */
export function SearchBar({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => toast("Command palette is coming soon.")}
      aria-label="Search"
      className={cn(
        "h-9 w-64 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 text-left">Search…</span>
      <kbd className="pointer-events-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  );
}
