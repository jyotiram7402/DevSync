import {
  MAX_RECENT_SEARCHES,
  MAX_SAVED_SEARCHES,
  SEARCH_STORAGE_KEYS,
} from "@/features/search/constants";
import type { RecentSearch, SavedSearch } from "@/features/search/types";
import { storage } from "@/utils/storage";

/**
 * SearchHistoryService — client-side persistence for recent + saved searches
 * (localStorage via the SSR-safe storage wrapper). No server round-trips, so
 * recents are instant and private to the device. Pure data operations.
 */
export const searchHistory = {
  listRecent(): RecentSearch[] {
    return storage.get<RecentSearch[]>(SEARCH_STORAGE_KEYS.recent, []);
  },

  addRecent(query: string): RecentSearch[] {
    const trimmed = query.trim();
    if (trimmed.length === 0) return searchHistory.listRecent();
    const now = new Date().toISOString();
    const existing = searchHistory
      .listRecent()
      .filter((entry) => entry.query.toLowerCase() !== trimmed.toLowerCase());
    const next = [{ query: trimmed, at: now }, ...existing].slice(0, MAX_RECENT_SEARCHES);
    storage.set(SEARCH_STORAGE_KEYS.recent, next);
    return next;
  },

  removeRecent(query: string): RecentSearch[] {
    const next = searchHistory.listRecent().filter((entry) => entry.query !== query);
    storage.set(SEARCH_STORAGE_KEYS.recent, next);
    return next;
  },

  clearRecent(): void {
    storage.remove(SEARCH_STORAGE_KEYS.recent);
  },

  listSaved(): SavedSearch[] {
    return storage.get<SavedSearch[]>(SEARCH_STORAGE_KEYS.saved, []);
  },

  addSaved(entry: Omit<SavedSearch, "id" | "createdAt">): SavedSearch[] {
    const saved: SavedSearch = {
      ...entry,
      id: `saved-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    const next = [saved, ...searchHistory.listSaved()].slice(0, MAX_SAVED_SEARCHES);
    storage.set(SEARCH_STORAGE_KEYS.saved, next);
    return next;
  },

  removeSaved(id: string): SavedSearch[] {
    const next = searchHistory.listSaved().filter((entry) => entry.id !== id);
    storage.set(SEARCH_STORAGE_KEYS.saved, next);
    return next;
  },
};
