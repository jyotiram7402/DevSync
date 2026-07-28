import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";

import type { TablesInsert } from "@/types/database";
import {
  CLIENT_TYPE,
  CLIENT_VERSION,
  DEVICE_ID_KEY,
  DEVICE_ONLINE_WINDOW_MS,
} from "~/lib/constants";
import { supabase } from "~/lib/supabase";
import type { DeviceInfo } from "~/types";

/**
 * Device registry — mirrors the extension's approach: a stable client-generated
 * id (persisted in SecureStore) used as the `devices.id`, upserted with the
 * `mobile` client type. RLS restricts every row to the signed-in user.
 */
function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function getDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = uuid();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  return id;
}

export function deviceName(): string {
  if (Device.deviceName) return Device.deviceName;
  return `${Device.manufacturer ?? "Android"} ${Device.modelName ?? "device"}`.trim();
}

export function osLabel(): string {
  return `${Device.osName ?? "Android"} ${Device.osVersion ?? ""}`.trim();
}

export async function getThisDeviceId(): Promise<string> {
  return getDeviceId();
}

export async function registerThisDevice(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const values: TablesInsert<"devices"> = {
    id: await getDeviceId(),
    user_id: user.id,
    name: deviceName(),
    os: osLabel(),
    browser: null,
    client_type: CLIENT_TYPE,
    client_version: CLIENT_VERSION,
    last_seen_at: new Date().toISOString(),
    revoked_at: null,
  };
  await supabase.from("devices").upsert(values, { onConflict: "id" });
}

export async function heartbeat(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("devices")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", await getDeviceId())
    .eq("user_id", user.id);
}

function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < DEVICE_ONLINE_WINDOW_MS;
}

export async function listDevices(): Promise<DeviceInfo[]> {
  const { data, error } = await supabase
    .from("devices")
    .select("id,name,os,browser,client_type,last_seen_at")
    .is("revoked_at", null)
    .order("last_seen_at", { ascending: false, nullsFirst: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    os: row.os,
    browser: row.browser,
    clientType: row.client_type,
    lastSeenAt: row.last_seen_at,
    online: isOnline(row.last_seen_at),
  }));
}
