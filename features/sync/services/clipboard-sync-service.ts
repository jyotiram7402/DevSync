/**
 * ClipboardSyncService — reads and validates clipboard content for the
 * "sync my clipboard" flow. Client-only (guards the Clipboard API). The
 * provider orchestrates persistence (create snippet) or offline queueing.
 */

/** Mirrors the snippets content DB constraint (validated again server-side). */
const MAX_CLIPBOARD_LENGTH = 100000;

export async function readClipboardText(): Promise<string | null> {
  if (
    typeof navigator === "undefined" ||
    typeof window === "undefined" ||
    !navigator.clipboard ||
    typeof navigator.clipboard.readText !== "function" ||
    !window.isSecureContext
  ) {
    return null;
  }
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

export interface ClipboardValidation {
  ok: boolean;
  message?: string;
  content?: string;
}

export function validateClipboardContent(text: string | null): ClipboardValidation {
  if (text === null) {
    return { ok: false, message: "Clipboard access is unavailable. Copy something and try again." };
  }
  const content = text.trim();
  if (content.length === 0) {
    return { ok: false, message: "Your clipboard is empty." };
  }
  if (content.length > MAX_CLIPBOARD_LENGTH) {
    return { ok: false, message: "Clipboard content is too large to sync." };
  }
  return { ok: true, content };
}
