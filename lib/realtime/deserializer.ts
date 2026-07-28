/**
 * Deserializer — validates and unwraps an incoming envelope.
 *
 * Rejects malformed messages (returns null) so callers never trust unvalidated
 * remote data. Backward compatibility: a bare payload with no envelope is
 * accepted and treated as protocol v1 under the supplied fallback name.
 */
import { PROTOCOL_VERSION } from "@/lib/realtime/constants";
import type { EventEnvelope } from "@/lib/realtime/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function looksLikeEnvelope(value: Record<string, unknown>): boolean {
  return typeof value.n === "string" && typeof value.v === "number" && "p" in value;
}

export interface DeserializeResult<T = unknown> {
  name: string;
  version: number;
  payload: T;
  at: string;
}

/**
 * Parse an incoming message into a normalized envelope. `fallbackName` is used
 * when the message is a bare (un-enveloped) payload from an older sender.
 */
export function deserialize<T = unknown>(
  raw: unknown,
  fallbackName?: string,
): DeserializeResult<T> | null {
  if (!isRecord(raw)) return null;

  if (looksLikeEnvelope(raw)) {
    const envelope = raw as unknown as EventEnvelope<T>;
    if (typeof envelope.n !== "string" || envelope.n.length === 0) return null;
    return {
      name: envelope.n,
      version: typeof envelope.v === "number" ? envelope.v : PROTOCOL_VERSION,
      payload: envelope.p,
      at: typeof envelope.t === "string" ? envelope.t : new Date().toISOString(),
    };
  }

  // Backward compatibility: bare payload from a pre-envelope sender.
  if (!fallbackName) return null;
  return {
    name: fallbackName,
    version: 1,
    payload: raw as unknown as T,
    at: new Date().toISOString(),
  };
}
