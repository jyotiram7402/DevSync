import { useCallback, useEffect, useState } from "react";

import { sendMessage } from "@ext/messaging/bus";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@ext/storage/settings";
import type { ExtensionSettings } from "@ext/types";

/** Read + update extension settings, notifying the background to reschedule alarms. */
export function useSettings() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void getSettings().then((value) => {
      setSettings(value);
      setLoaded(true);
    });
  }, []);

  const update = useCallback(async (patch: Partial<ExtensionSettings>) => {
    const next = await saveSettings(patch);
    setSettings(next);
    void sendMessage({ type: "SETTINGS_CHANGED" });
    return next;
  }, []);

  return { settings, loaded, update };
}
