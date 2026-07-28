import { z } from "zod";

import { MAX_CLIPBOARD_LENGTH } from "@ext/shared/constants";
import type { ExtensionMessage } from "@ext/messaging/types";

/**
 * Runtime validation for every inbound message. Untrusted senders (content
 * scripts run in page contexts) can post anything; unknown or malformed
 * messages are rejected before reaching a handler.
 */
const schemas = {
  PING: z.object({ type: z.literal("PING") }),
  GET_STATE: z.object({ type: z.literal("GET_STATE") }),
  SIGN_IN: z.object({
    type: z.literal("SIGN_IN"),
    email: z.string().email(),
    password: z.string().min(1).max(1024),
  }),
  SIGN_OUT: z.object({ type: z.literal("SIGN_OUT") }),
  TRIGGER_SYNC: z.object({ type: z.literal("TRIGGER_SYNC") }),
  SAVE_CLIPBOARD: z.object({
    type: z.literal("SAVE_CLIPBOARD"),
    content: z.string().min(1).max(MAX_CLIPBOARD_LENGTH),
    title: z.string().max(200).optional(),
    language: z.string().max(40).optional(),
  }),
  SELECTION_CAPTURED: z.object({
    type: z.literal("SELECTION_CAPTURED"),
    text: z.string().min(1).max(MAX_CLIPBOARD_LENGTH),
    url: z.string().max(2048),
  }),
  SETTINGS_CHANGED: z.object({ type: z.literal("SETTINGS_CHANGED") }),
} as const;

export function parseMessage(raw: unknown): ExtensionMessage | null {
  if (typeof raw !== "object" || raw === null) return null;
  const type = (raw as { type?: unknown }).type;
  if (typeof type !== "string" || !(type in schemas)) return null;
  const schema = schemas[type as keyof typeof schemas];
  const result = schema.safeParse(raw);
  return result.success ? (result.data as ExtensionMessage) : null;
}
