"use server";

import * as deviceService from "@/features/sync/services/device-service";
import type { ActionResult } from "@/types/api";

/**
 * Sync server actions — the client entry points for device registration and
 * heartbeat. Thin wrappers over the DeviceRegistry service (RLS is the boundary).
 */
export async function registerDeviceAction(
  input: deviceService.DeviceRegistrationInput,
): Promise<ActionResult> {
  return deviceService.upsertDevice(input);
}

export async function heartbeatAction(deviceId: string): Promise<ActionResult> {
  return deviceService.touchDevice(deviceId);
}
