import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionError, ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";
import type { TablesInsert } from "@/types/database";

/**
 * DeviceRegistry — server-side device persistence. The device id is the
 * client-generated stable UUID (used as the devices.id PK) so registration is
 * an idempotent upsert. RLS ensures a user can only touch their own device rows.
 */
export interface DeviceRegistrationInput {
  deviceId: string;
  name: string;
  os: string | null;
  browser: string | null;
  clientType: string;
  clientVersion: string;
}

const UNAUTHENTICATED: ActionError = {
  code: "UNAUTHENTICATED",
  message: "You must be signed in to sync devices.",
};

function toActionError(error: unknown): ActionError {
  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";
  if (/row-level security|violates row-level|permission denied/i.test(message)) {
    return { code: "FORBIDDEN", message: "You do not have permission to do that." };
  }
  // eslint-disable-next-line no-console
  console.error("[sync] device service error:", message);
  return { code: "INTERNAL", message: "Something went wrong. Please try again." };
}

export async function upsertDevice(input: DeviceRegistrationInput): Promise<ActionResult> {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return err(UNAUTHENTICATED);

  const values: TablesInsert<"devices"> = {
    id: input.deviceId,
    user_id: user.id,
    name: input.name,
    os: input.os,
    browser: input.browser,
    client_type: input.clientType,
    client_version: input.clientVersion,
    last_seen_at: new Date().toISOString(),
    revoked_at: null,
  };

  const { error } = await client.from("devices").upsert(values, { onConflict: "id" });
  if (error) return err(toActionError(error));
  return ok(undefined);
}

export async function touchDevice(deviceId: string): Promise<ActionResult> {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return err(UNAUTHENTICATED);

  const { error } = await client
    .from("devices")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", deviceId)
    .eq("user_id", user.id);
  if (error) return err(toActionError(error));
  return ok(undefined);
}
