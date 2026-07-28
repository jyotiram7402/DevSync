import { browser } from "@ext/utils/browser";
import type { StorageKey } from "@ext/storage/keys";

/**
 * Typed wrapper over chrome.storage.local. Async, cross-browser (polyfill), and
 * resilient — reads fall back to a default rather than throwing.
 */
export async function getStored<T>(key: StorageKey, fallback: T): Promise<T> {
  try {
    const result = await browser.storage.local.get(key);
    const value = result[key];
    return value === undefined ? fallback : (value as T);
  } catch {
    return fallback;
  }
}

export async function setStored<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await browser.storage.local.set({ [key]: value });
  } catch {
    // Best-effort; storage may be unavailable in rare contexts.
  }
}

export async function removeStored(key: StorageKey): Promise<void> {
  try {
    await browser.storage.local.remove(key);
  } catch {
    // Ignore.
  }
}

/** Subscribe to changes for a single key in the `local` area. Returns a disposer. */
export function onStoredChange<T>(key: StorageKey, listener: (value: T | undefined) => void): () => void {
  const handler = (
    changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
    areaName: string,
  ): void => {
    if (areaName !== "local") return;
    const change = changes[key];
    if (change) listener(change.newValue as T | undefined);
  };
  browser.storage.onChanged.addListener(handler);
  return () => browser.storage.onChanged.removeListener(handler);
}
