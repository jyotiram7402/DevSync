import * as Clipboard from "expo-clipboard";

/**
 * Clipboard access — READ ONLY ON USER ACTION (paste). Android 12+ shows a
 * toast when an app reads the clipboard, and background clipboard monitoring is
 * intentionally NOT implemented (privacy + platform restrictions). "Auto sync"
 * is therefore opt-in and foreground-only.
 */
export async function getClipboardText(): Promise<string | null> {
  try {
    const hasText = await Clipboard.hasStringAsync();
    if (!hasText) return null;
    const value = await Clipboard.getStringAsync();
    return value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export async function setClipboardText(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}
