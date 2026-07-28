/** Selection capture helpers (page context). No DOM mutation, read-only. */
export function getSelectedText(): string {
  if (typeof window === "undefined" || !window.getSelection) return "";
  return (window.getSelection()?.toString() ?? "").trim();
}
