import { STORAGE_KEYS } from "@ext/storage/keys";
import { getStored, setStored } from "@ext/storage/storage";
import type { ExtensionSettings } from "@ext/types";

export const DEFAULT_SETTINGS: ExtensionSettings = {
  theme: "system",
  captureClipboard: true,
  autoSync: true,
  showNotifications: false,
  telemetry: false,
  activeWorkspaceId: null,
};

/** Read settings, merged over defaults (so new keys get sane values). */
export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await getStored<Partial<ExtensionSettings>>(STORAGE_KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(patch: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
  const next = { ...(await getSettings()), ...patch };
  await setStored(STORAGE_KEYS.settings, next);
  return next;
}
