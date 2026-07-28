"use client";

import { create } from "zustand";

/**
 * Client selection store for bulk actions. Keeping selection in a store lets
 * card checkboxes stay lightweight leaves while the server renders the list.
 */
interface SnippetSelectionState {
  selectedIds: string[];
  toggle: (id: string) => void;
  clear: () => void;
  setMany: (ids: string[]) => void;
}

export const useSnippetSelection = create<SnippetSelectionState>()((set) => ({
  selectedIds: [],
  toggle: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((value) => value !== id)
        : [...state.selectedIds, id],
    })),
  clear: () => set({ selectedIds: [] }),
  setMany: (ids) => set({ selectedIds: ids }),
}));
