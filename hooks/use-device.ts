"use client";

import { useEffect, useState } from "react";

import { getDeviceMetadata } from "@/lib/device/device";
import type { DeviceMetadata } from "@/types/device";

/**
 * Returns the current device's metadata. Resolves after mount (device id and
 * user-agent detection are client-only), returning null during SSR/first paint
 * to avoid hydration mismatches.
 */
export function useDevice(): DeviceMetadata | null {
  const [device, setDevice] = useState<DeviceMetadata | null>(null);

  useEffect(() => {
    setDevice(getDeviceMetadata());
  }, []);

  return device;
}
