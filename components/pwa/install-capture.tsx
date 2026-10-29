"use client";

import { useEffect } from "react";

import { startInstallCapture } from "@/lib/pwa/install-prompt";

/** Starts listening for the browser's install offer as soon as the app loads. Renders nothing. */
export function InstallCapture() {
  useEffect(() => {
    startInstallCapture();
  }, []);
  return null;
}
