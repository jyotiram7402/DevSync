"use client";

import { useSyncExternalStore } from "react";

import {
  getInstallState,
  getServerInstallState,
  subscribeInstall,
  type InstallState,
} from "@/lib/pwa/install-prompt";

/** Whether the browser is offering to install the app right now (see lib/pwa/install-prompt). */
export function useInstallPrompt(): InstallState {
  return useSyncExternalStore(subscribeInstall, getInstallState, getServerInstallState);
}
