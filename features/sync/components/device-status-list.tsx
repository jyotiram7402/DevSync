"use client";

import { Laptop } from "lucide-react";

import { useDevicePresence } from "@/features/sync/hooks/use-device-presence";
import { cn } from "@/utils/cn";

/**
 * DeviceStatusList — the devices currently online in this workspace (live
 * presence). This device is marked; no management controls (status only).
 */
export function DeviceStatusList({ className }: { className?: string }) {
  const { devices, thisDeviceId } = useDevicePresence();

  if (devices.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>No other devices online.</p>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-2", className)} aria-label="Online devices">
      {devices.map((device) => {
        const isSelf = device.deviceId === thisDeviceId;
        return (
          <li key={device.deviceId} className="flex items-center gap-2 text-sm">
            <span
              className="size-2 shrink-0 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            <Laptop className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{device.name}</span>
            {isSelf ? <span className="text-xs text-muted-foreground">(this device)</span> : null}
          </li>
        );
      })}
    </ul>
  );
}
