"use client";

import { useRouter } from "next/navigation";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";

import { KeyboardShortcutHint } from "@/features/search/components/keyboard-shortcut-hint";
import { RecentSearches } from "@/features/search/components/recent-searches";
import { SearchEmptyState } from "@/features/search/components/search-empty-state";
import { SearchResults } from "@/features/search/components/search-results";
import { SearchTabs } from "@/features/search/components/search-tabs";
import { SEARCH_ROUTE } from "@/features/search/constants";
import { useRecentSearches } from "@/features/search/hooks/use-recent-searches";
import { useSearch } from "@/features/search/hooks/use-search";
import { useSearchNavigation } from "@/features/search/hooks/use-search-navigation";
import type { SearchResult } from "@/features/search/types";

const LIST_ID = "search-modal-results";

function trapTab(event: KeyboardEvent<HTMLElement>, panel: HTMLElement | null): void {
  if (event.key !== "Tab" || !panel) return;
  const focusables = Array.from(
    panel.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.offsetParent !== null);
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (!first || !last) return;
  const activeEl = document.activeElement;
  if (event.shiftKey && activeEl === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && activeEl === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * SearchModal — the global command-style search palette. Focus-trapped, ESC to
 * close, arrow-key navigation with Enter to open, and instant (debounced)
 * results. Restores focus to the trigger on close.
 */
export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useSearch({ searchOnEmpty: false });
  const { query, setQuery, results, counts, activeType, setActiveType, loading, error } = search;
  const recent = useRecentSearches();

  const hasQuery = query.trim().length > 0;

  const goTo = useCallback(
    (result: SearchResult) => {
      recent.add(query);
      onClose();
      router.push(result.href);
    },
    [recent, query, onClose, router],
  );

  const navigation = useSearchNavigation(results.length, {
    onSelect: (index) => {
      const result = results[index];
      if (result) goTo(result);
    },
    onClose,
  });
  const activeOptionId =
    hasQuery && results.length > 0 ? `${LIST_ID}-opt-${navigation.activeIndex}` : undefined;

  // Keep the highlighted result in view while moving with the arrow keys.
  useEffect(() => {
    if (activeOptionId) document.getElementById(activeOptionId)?.scrollIntoView({ block: "nearest" });
  }, [activeOptionId]);

  // Focus management + scroll lock while open; restore focus on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  // Escape closes from anywhere in the panel; arrows and Enter only drive the
  // results from the search box (Enter on a focused tab or link does its own thing).
  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    trapTab(event, panelRef.current);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") return;
    navigation.handleKeyDown(event);
  }

  function openFullSearch() {
    if (hasQuery) recent.add(query);
    onClose();
    router.push(`${SEARCH_ROUTE}?query=${encodeURIComponent(query.trim())}`);
  }

  return (
    // Full-screen sheet on phones; a centered palette (⌘K) from md up.
    <div className="fixed inset-0 z-modal flex items-start justify-center md:p-4 md:pt-[10dvh]">
      <div className="absolute inset-0 bg-scrim/50 animate-overlay-in" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onKeyDown={onPanelKeyDown}
        className="relative z-10 flex h-dvh w-full flex-col overflow-hidden bg-popover pt-safe text-popover-foreground animate-overlay-in md:h-auto md:max-h-[80dvh] md:max-w-xl md:rounded-xl md:border md:border-border md:pt-0 md:shadow-overlay md:animate-dialog-in"
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={hasQuery}
            aria-controls={LIST_ID}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            onKeyDown={onInputKeyDown}
            aria-label="Search snippets, projects, collections, and tags"
            placeholder="Search everything…"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {loading ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 h-11 shrink-0 rounded-md px-2 text-sm font-medium text-primary-ink active:bg-accent md:hidden"
          >
            Cancel
          </button>
        </div>

        {hasQuery ? (
          <div className="border-b px-3 py-2">
            <SearchTabs active={activeType} counts={counts} onChange={setActiveType} />
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
          {hasQuery ? (
            <SearchResults
              results={results}
              query={query}
              loading={loading}
              error={error}
              hasQuery={hasQuery}
              variant="infinite"
              listId={LIST_ID}
              activeIndex={navigation.activeIndex}
              onActiveChange={navigation.setActiveIndex}
              onSelect={goTo}
              hasMore={search.hasMore}
              onLoadMore={search.loadMore}
              onRetry={search.refresh}
            />
          ) : recent.recent.length > 0 ? (
            <RecentSearches
              recent={recent.recent}
              onSelect={setQuery}
              onRemove={recent.remove}
              onClear={recent.clear}
            />
          ) : (
            <SearchEmptyState variant="idle" />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-2">
          {/* Keyboard hints only where there is a keyboard. */}
          <div className="hidden items-center gap-3 pointer-fine:flex">
            <KeyboardShortcutHint keys={["↑", "↓"]} label="Navigate" />
            <KeyboardShortcutHint keys={["↵"]} label="Open" />
            <KeyboardShortcutHint keys={["Esc"]} label="Close" />
          </div>
          <button
            type="button"
            onClick={openFullSearch}
            className="ml-auto h-9 rounded-md px-2 text-sm font-medium text-primary-ink hover:underline active:bg-accent pointer-coarse:h-11"
          >
            Full search
          </button>
        </div>
      </div>
    </div>
  );
}
