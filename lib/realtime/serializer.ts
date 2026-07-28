/**
 * Serializer — wraps an outgoing event payload in a versioned envelope.
 *
 * The envelope carries the protocol version and event name so receivers can
 * validate and evolve schemas over time. Payloads are expected to be plain,
 * JSON-serializable data (identifiers, never secrets or full records).
 */
import { PROTOCOL_VERSION } from "@/lib/realtime/constants";
import type { EventEnvelope } from "@/lib/realtime/types";

export function serialize<T>(name: string, payload: T, version: number = PROTOCOL_VERSION): EventEnvelope<T> {
  return {
    v: version,
    n: name,
    t: new Date().toISOString(),
    p: payload,
  };
}

/** Compression hook (future): identity today, kept as a stable seam. */
export function encodeEnvelope<T>(envelope: EventEnvelope<T>): EventEnvelope<T> {
  return envelope;
}
