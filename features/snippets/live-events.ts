import type { Snippet } from "@/features/snippets/types";

/**
 * Tells the lists open on this device about a snippet it just saved, so the
 * item appears at once instead of waiting for the server to re-render the
 * page or for the device's own live update to come back. In memory, per tab.
 */
type Listener = (snippet: Snippet) => void;

const listeners = new Set<Listener>();

export function announceSavedSnippet(snippet: Snippet): void {
  for (const listener of listeners) listener(snippet);
}

/** Returns the unsubscribe function. */
export function onSavedSnippet(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
