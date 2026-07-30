"use client";

import { useEffect } from "react";

import { heartbeatAction, registerDeviceAction } from "@/features/sync/actions";
import { getDeviceMetadata } from "@/lib/device/device";

/** Heartbeat interval — keeps this browser shown as "active now". */
const HEARTBEAT_MS = 120_000;

/**
 * Registers this browser in the `devices` table (stable id from localStorage)
 * and keeps `last_seen_at` fresh, so the web client appears alongside the
 * Android app and extension under Connected devices. Renders nothing.
 */
export function RegisterDevice() {
  useEffect(() => {
    const metadata = getDeviceMetadata();
    void registerDeviceAction(metadata);

    const interval = setInterval(() => {
      void heartbeatAction(metadata.deviceId);
    }, HEARTBEAT_MS);

    return () => clearInterval(interval);
  }, []);

  return null;
}
