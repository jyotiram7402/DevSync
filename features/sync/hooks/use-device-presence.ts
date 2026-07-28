"use client";

import { useSync } from "@/features/sync/hooks/use-sync";
import type { DevicePresence } from "@/features/sync/types";

export interface DevicePresenceApi {
  devices: DevicePresence[];
  count: number;
  thisDeviceId: string | null;
}

/** Live list of devices present in the workspace, plus this device's id. */
export function useDevicePresence(): DevicePresenceApi {
  const { devices, device } = useSync();
  return {
    devices,
    count: devices.length,
    thisDeviceId: device?.deviceId ?? null,
  };
}
