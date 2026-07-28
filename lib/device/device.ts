import type { ClientType, DeviceMetadata, DeviceRegistrationInput } from "@/types/device";
import { storage } from "@/utils/storage";

/**
 * Device identification & metadata (client-side).
 *
 * A stable device id is generated once and persisted in localStorage. Platform
 * detection is best-effort from the user agent. These functions are meaningful
 * only in the browser; on the server they degrade gracefully (empty UA, and the
 * SSR-safe storage wrapper no-ops). Persisting to the `devices` table is a
 * later, service-layer concern.
 */
const DEVICE_ID_KEY = "devsync:device-id";

export const CLIENT_TYPE: ClientType = "web";
export const CLIENT_VERSION = "0.1.0";

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Returns the stable device id, creating and persisting one on first call. */
export function getDeviceId(): string {
  const existing = storage.get<string | null>(DEVICE_ID_KEY, null);
  if (existing) return existing;
  const id = generateId();
  storage.set(DEVICE_ID_KEY, id);
  return id;
}

function detectOS(userAgent: string): string | null {
  if (/windows/i.test(userAgent)) return "Windows";
  if (/mac os x|macintosh/i.test(userAgent)) return "macOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return null;
}

function detectBrowser(userAgent: string): string | null {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/chrome|chromium|crios/i.test(userAgent)) return "Chrome";
  if (/firefox|fxios/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent)) return "Safari";
  return null;
}

function deviceName(os: string | null, browser: string | null): string {
  return `${browser ?? "Browser"} on ${os ?? "Unknown OS"}`;
}

/** Build the current device's metadata (identity + platform + client info). */
export function getDeviceMetadata(): DeviceMetadata {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const os = detectOS(userAgent);
  const browser = detectBrowser(userAgent);

  return {
    deviceId: getDeviceId(),
    name: deviceName(os, browser),
    os,
    browser,
    clientType: CLIENT_TYPE,
    clientVersion: CLIENT_VERSION,
  };
}

/** Convert metadata into a registration payload for persistence (future). */
export function toRegistrationInput(metadata: DeviceMetadata): DeviceRegistrationInput {
  return {
    name: metadata.name,
    os: metadata.os,
    browser: metadata.browser,
    clientType: metadata.clientType,
    clientVersion: metadata.clientVersion,
  };
}
