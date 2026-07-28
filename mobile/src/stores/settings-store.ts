import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Settings } from "~/types";

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  autoSyncClipboard: false,
  compressImages: true,
  wifiOnlyUploads: false,
  telemetry: false,
  developerMode: false,
  activeWorkspaceId: null,
};

interface SettingsState {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      update: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
    }),
    { name: "devsync-settings", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
