import browser from "webextension-polyfill";

/**
 * Single cross-browser entry point for extension APIs. Using the
 * webextension-polyfill `browser.*` promise API (instead of `chrome.*`
 * callbacks) is what keeps the Firefox port minimal — no call sites change.
 */
export { browser };

export function runtimeUrl(path: string): string {
  return browser.runtime.getURL(path);
}

/** Open (or focus) a DevSync web URL in a normal browser tab. */
export async function openTab(url: string): Promise<void> {
  await browser.tabs.create({ url });
}

export function isServiceWorker(): boolean {
  return typeof window === "undefined";
}
