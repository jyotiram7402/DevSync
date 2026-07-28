import { getSelectedText } from "@ext/content/selection";
import { browser } from "@ext/utils/browser";

/**
 * Content script — intentionally minimal and scoped (manifest matches only the
 * DevSync web origin). It injects NO UI and NO business logic into pages. It
 * only answers a selection request from the extension, so the popup can offer
 * "save current selection". Future context-menu actions and inline insertion
 * will build on this same read-only bridge.
 */
interface SelectionRequest {
  type: "REQUEST_SELECTION";
}

function isSelectionRequest(raw: unknown): raw is SelectionRequest {
  return (
    typeof raw === "object" &&
    raw !== null &&
    (raw as { type?: unknown }).type === "REQUEST_SELECTION"
  );
}

browser.runtime.onMessage.addListener(
  (raw: unknown): Promise<{ text: string }> | undefined => {
    if (!isSelectionRequest(raw)) return undefined; // let other listeners handle
    return Promise.resolve({ text: getSelectedText() });
  },
);
