import type { TypedSupabaseClient } from "@/lib/supabase/types";

/**
 * Shared realtime types.
 *
 * RealtimeChannel and the channel options type are DERIVED from the Supabase
 * client's own `channel` method rather than imported by name, so they stay
 * correct across @supabase/supabase-js versions without depending on which
 * type identifiers that package happens to export.
 */
export type RealtimeChannel = ReturnType<TypedSupabaseClient["channel"]>;
export type ChannelOptions = Parameters<TypedSupabaseClient["channel"]>[1];

/** Coarse, UI-friendly connection status aggregated by the ConnectionManager. */
export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

/**
 * Payload tracked for a member present on a workspace presence channel.
 * The index signature keeps it compatible with Supabase's presence generic
 * (which constrains the payload to an object of unknown values).
 */
export interface PresencePayload {
  userId: string;
  deviceId: string | null;
  displayName: string | null;
  onlineAt: string;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------------- */
/* Channel + subscription model                                              */
/* ------------------------------------------------------------------------- */

/** Logical kind of a channel, used for naming and (later) authorization. */
export type ChannelKind = "workspace" | "project" | "snippet" | "user" | "device" | "presence" | "system";

/** Relative importance of a subscription when batching/recovering. */
export type SubscriptionPriority = "high" | "normal" | "low";

/** Filter for a Postgres change binding. */
export interface PostgresChangesFilter {
  event: "*" | "INSERT" | "UPDATE" | "DELETE";
  schema: string;
  table?: string;
  filter?: string;
}

/** A binding attached to a channel before it subscribes. */
export type ChannelBinding =
  | { type: "postgres_changes"; filter: PostgresChangesFilter; handler: (payload: unknown) => void }
  | { type: "broadcast"; event: string; handler: (payload: unknown) => void }
  | { type: "presence"; event: "sync" | "join" | "leave"; handler: () => void };

/** Declarative description of a logical subscription (deduped by `key`). */
export interface SubscriptionDescriptor {
  /** Unique logical id; identical keys are de-duplicated (ref-counted). */
  key: string;
  channelName: string;
  channelOptions?: ChannelOptions;
  priority?: SubscriptionPriority;
  bindings: ChannelBinding[];
  /** Observe raw channel subscribe-status transitions. */
  onStatus?: (status: string) => void;
}

/* ------------------------------------------------------------------------- */
/* Event model                                                               */
/* ------------------------------------------------------------------------- */

export type EventScope = "local" | "remote" | "internal";

/** A message as it travels on the bus, regardless of origin. */
export interface BusEvent<T = unknown> {
  name: string;
  scope: EventScope;
  payload: T;
  /** ISO timestamp of dispatch. */
  at: string;
  /** Schema version of the payload. */
  version: number;
}

/** The versioned envelope used on the wire for broadcast events. */
export interface EventEnvelope<T = unknown> {
  /** Protocol version. */
  v: number;
  /** Event name. */
  n: string;
  /** ISO timestamp. */
  t: string;
  /** Payload. */
  p: T;
}
