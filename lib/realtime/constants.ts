/**
 * Realtime platform constants.
 *
 * Central, tunable timings and limits for the connection/subscription layers.
 * Pure values only — no logic, no environment access.
 */
export const REALTIME_TIMING = {
  /** Socket keepalive interval (used by browser.ts). Short, so a dead socket is noticed within seconds. */
  heartbeatIntervalMs: 15_000,
  /** How long a heartbeat/latency probe may take before it is considered lost. */
  heartbeatTimeoutMs: 10_000,
  /** Interval for the round-trip latency probe. */
  latencyProbeIntervalMs: 30_000,
  /** Delay before re-tracking presence after a resume, letting the socket settle. */
  resumeSettleMs: 400,
  /** Debounce window for coalescing presence sync bursts. */
  presenceSyncDebounceMs: 150,
} as const;

export const REALTIME_LIMITS = {
  /** Max attempts for platform-level (not socket-level) resubscribe. */
  maxResubscribeAttempts: 8,
  /** Cap on the de-duplication seen-set before it is cleared. */
  maxSeenEvents: 1_000,
  /** Cap on retained latency samples for the rolling average. */
  maxLatencySamples: 20,
} as const;

/** Reconnect waits: 1s, 2s, 4s, 8s, then every 10s (plus jitter). Never half a minute. */
export const REALTIME_BACKOFF = {
  baseMs: 1_000,
  maxMs: 10_000,
  factor: 2,
} as const;

/** Wire-protocol version stamped onto every serialized broadcast envelope. */
export const PROTOCOL_VERSION = 1;

/** Scope of an event as it flows through the bus. */
export const EVENT_SCOPES = {
  local: "local",
  remote: "remote",
  internal: "internal",
} as const;

/** Internal (platform) event names — never business events. */
export const INTERNAL_EVENTS = {
  connectionStatusChanged: "internal.connection.status",
  onlineChanged: "internal.connection.online",
  subscriptionAdded: "internal.subscription.added",
  subscriptionRemoved: "internal.subscription.removed",
  messageDropped: "internal.message.dropped",
  latencyMeasured: "internal.latency.measured",
} as const;
