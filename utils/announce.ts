/**
 * Polite screen-reader announcements ("Copied", "Uploaded", "1 new item").
 *
 * One visually hidden `aria-live` region is created on first use and reused.
 * Pass short status messages only — never item contents. Safe to import
 * anywhere: it no-ops outside the browser.
 */
let region: HTMLElement | null = null;
let showTimer: number | undefined;
let clearTimer: number | undefined;

function getRegion(): { node: HTMLElement; created: boolean } | null {
  if (typeof document === "undefined") return null;
  if (region && region.isConnected) return { node: region, created: false };

  const node = document.createElement("div");
  node.setAttribute("aria-live", "polite");
  node.setAttribute("aria-atomic", "true");
  node.setAttribute("data-live-region", "");
  Object.assign(node.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
  });
  document.body.appendChild(node);
  region = node;
  return { node, created: true };
}

export function announce(message: string): void {
  const target = getRegion();
  if (!target) return;
  const { node, created } = target;

  window.clearTimeout(showTimer);
  window.clearTimeout(clearTimer);
  node.textContent = "";
  // Re-inserting the text after a beat makes a repeated message ("Copied")
  // announce again; a brand-new region needs a little longer to register.
  showTimer = window.setTimeout(
    () => {
      node.textContent = message;
    },
    created ? 150 : 50,
  );
  clearTimer = window.setTimeout(() => {
    node.textContent = "";
  }, 5000);
}
