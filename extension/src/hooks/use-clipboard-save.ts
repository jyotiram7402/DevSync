import { useCallback, useState } from "react";

import { sendMessage } from "@ext/messaging/bus";
import { readClipboard, validateClipboard } from "@ext/services/clipboard";

export type SaveFeedback = { type: "success" | "error" | "info"; text: string };

/**
 * "Save clipboard as snippet" flow: read the clipboard in the popup (a document
 * context with the user gesture), validate, then route the create through the
 * background so it uses the single shared sync path.
 */
export function useClipboardSave(onSaved?: () => void) {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<SaveFeedback | null>(null);

  const save = useCallback(async () => {
    setSaving(true);
    setFeedback(null);

    const validation = validateClipboard(await readClipboard());
    if (!validation.ok || !validation.content) {
      setFeedback({ type: "error", text: validation.message ?? "Nothing to save." });
      setSaving(false);
      return;
    }

    const result = await sendMessage({ type: "SAVE_CLIPBOARD", content: validation.content });
    setSaving(false);

    if (!result.ok) {
      setFeedback({ type: "error", text: result.error });
      return;
    }
    if (result.data.queued) {
      setFeedback({ type: "info", text: "Saved offline — will sync when you reconnect." });
    } else {
      setFeedback({ type: "success", text: "Saved to DevSync." });
      onSaved?.();
    }
  }, [onSaved]);

  return { save, saving, feedback };
}
