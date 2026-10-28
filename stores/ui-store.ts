import { create } from "zustand";

/**
 * Global UI store (Zustand).
 *
 * Holds cross-feature, client-only UI state that has no server home. It is the
 * established pattern for global client state in DevSync; server data is never
 * stored here (Postgres is the source of truth — see
 * docs/architecture/04-State-Management.md).
 */
interface UIState {
  /** Whether the global command menu is open. */
  commandMenuOpen: boolean;
  setCommandMenuOpen: (open: boolean) => void;
  toggleCommandMenu: () => void;

  /** Desktop sidebar collapsed (icon-only) state. */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  /** Phone bottom bar: the "Add" sheet (＋) and the "More" sheet. */
  addSheetOpen: boolean;
  setAddSheetOpen: (open: boolean) => void;
  moreSheetOpen: boolean;
  setMoreSheetOpen: (open: boolean) => void;

  /**
   * Human label for the current page's final breadcrumb (e.g. a room or item
   * name), set by detail pages so the trail never shows a raw id.
   */
  breadcrumbLabel: string | null;
  setBreadcrumbLabel: (label: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  commandMenuOpen: false,
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
  toggleCommandMenu: () => set((state) => ({ commandMenuOpen: !state.commandMenuOpen })),

  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  addSheetOpen: false,
  setAddSheetOpen: (open) => set({ addSheetOpen: open }),
  moreSheetOpen: false,
  setMoreSheetOpen: (open) => set({ moreSheetOpen: open }),

  breadcrumbLabel: null,
  setBreadcrumbLabel: (label) => set({ breadcrumbLabel: label }),
}));
