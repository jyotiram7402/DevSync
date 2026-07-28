import { MAX_CLIPBOARD_LENGTH } from "@ext/shared/constants";

/**
 * Safe clipboard access. Only ever called from a document context with a user
 * gesture (the popup) — the service worker has no clipboard. Failures are
 * swallowed into null/false so a blocked permission never throws.
 */
export async function readClipboard(): Promise<string | null> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.readText) return null;
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

export async function writeClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export interface ClipboardValidation {
  ok: boolean;
  content?: string;
  message?: string;
}

export function validateClipboard(text: string | null): ClipboardValidation {
  if (text === null) {
    return { ok: false, message: "Clipboard is unavailable. Copy something and try again." };
  }
  const content = text.trim();
  if (content.length === 0) return { ok: false, message: "Your clipboard is empty." };
  if (content.length > MAX_CLIPBOARD_LENGTH) {
    return { ok: false, message: "Clipboard content is too large to sync." };
  }
  return { ok: true, content };
}
