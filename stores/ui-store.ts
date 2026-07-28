import { create } from "zustand";

/**
 * Global UI store (Zustand).
 *
 * Holds cross-feature, client-only UI state that has no server home. It is the
 * established pattern for global client state in DevSync; server data is never
 * stored here (Postgres is the source of truth — see
 * docs/architecture/04-State-Management.md).
 *
 * It ships with the command-menu open/close slice as the first real piece of
 * global UI state, consumed once the command menu lands.
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

  /** Mobile navigation drawer open state. */
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  commandMenuOpen: false,
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
  toggleCommandMenu: () => set((state) => ({ commandMenuOpen: !state.commandMenuOpen })),

  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
}));
