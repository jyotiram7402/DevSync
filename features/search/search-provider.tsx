"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { SearchModal } from "@/features/search/components/search-modal";
import { useSearchShortcuts } from "@/features/search/hooks/use-search-shortcuts";

/**
 * SearchProvider — owns global search-modal open state, wires the ⌘K/Ctrl+K
 * shortcut, and renders the palette once for the whole dashboard. Mount inside
 * the authenticated shell so the shortcut is available everywhere.
 */
export interface SearchModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SearchModalContext = createContext<SearchModalContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<SearchModalContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((current) => !current),
    }),
    [isOpen],
  );

  useSearchShortcuts(value.open);

  return (
    <SearchModalContext.Provider value={value}>
      {children}
      <SearchModal open={isOpen} onClose={value.close} />
    </SearchModalContext.Provider>
  );
}

export function useSearchModal(): SearchModalContextValue {
  const context = useContext(SearchModalContext);
  if (context === undefined) {
    throw new Error("useSearchModal must be used within a <SearchProvider>.");
  }
  return context;
}
