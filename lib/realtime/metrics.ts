/**
 * Realtime metrics collector (internal, observability only).
 *
 * Accumulates counters, gauges, and a rolling latency window. Emits change
 * notifications so a debug panel can render live values. No network calls, no
 * PII — purely local instrumentation.
 */
import { REALTIME_LIMITS } from "@/lib/realtime/constants";

export interface MetricsSnapshot {
  /** Total successful (re)connections observed. */
  connectCount: number;
  /** Reconnections after an initial connect. */
  reconnectCount: number;
  /** Messages dropped due to invalid/unauthorized/malformed payloads. */
  droppedMessages: number;
  /** Duplicate deliveries filtered. */
  duplicateMessages: number;
  /** Currently active logical subscriptions. */
  subscriptionCount: number;
  /** Currently open channels. */
  channelCount: number;
  /** Most recent round-trip latency in ms (null if never measured). */
  lastLatencyMs: number | null;
  /** Rolling average latency in ms (null if no samples). */
  averageLatencyMs: number | null;
  /** ISO timestamp of the current connection start (null when disconnected). */
  connectedSince: string | null;
  /** Connection duration in ms (0 when disconnected). */
  connectionDurationMs: number;
}

type MetricsListener = (snapshot: MetricsSnapshot) => void;

export class MetricsCollector {
  private connectCount = 0;
  private reconnectCount = 0;
  private droppedMessages = 0;
  private duplicateMessages = 0;
  private subscriptionCount = 0;
  private channelCount = 0;
  private latencySamples: number[] = [];
  private connectedAt: number | null = null;

  private readonly listeners = new Set<MetricsListener>();

  onChange(listener: MetricsListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  markConnected(isReconnect: boolean): void {
    this.connectCount += 1;
    if (isReconnect) this.reconnectCount += 1;
    this.connectedAt = Date.now();
    this.notify();
  }

  markDisconnected(): void {
    this.connectedAt = null;
    this.notify();
  }

  incrementDropped(): void {
    this.droppedMessages += 1;
    this.notify();
  }

  incrementDuplicate(): void {
    this.duplicateMessages += 1;
    this.notify();
  }

  setSubscriptionCount(count: number): void {
    this.subscriptionCount = Math.max(0, count);
    this.notify();
  }

  setChannelCount(count: number): void {
    this.channelCount = Math.max(0, count);
    this.notify();
  }

  recordLatency(ms: number): void {
    if (!Number.isFinite(ms) || ms < 0) return;
    this.latencySamples.push(ms);
    if (this.latencySamples.length > REALTIME_LIMITS.maxLatencySamples) {
      this.latencySamples.shift();
    }
    this.notify();
  }

  snapshot(): MetricsSnapshot {
    const lastLatencyMs =
      this.latencySamples.length > 0
        ? (this.latencySamples[this.latencySamples.length - 1] ?? null)
        : null;
    const averageLatencyMs =
      this.latencySamples.length > 0
        ? Math.round(this.latencySamples.reduce((sum, n) => sum + n, 0) / this.latencySamples.length)
        : null;

    return {
      connectCount: this.connectCount,
      reconnectCount: this.reconnectCount,
      droppedMessages: this.droppedMessages,
      duplicateMessages: this.duplicateMessages,
      subscriptionCount: this.subscriptionCount,
      channelCount: this.channelCount,
      lastLatencyMs,
      averageLatencyMs,
      connectedSince: this.connectedAt !== null ? new Date(this.connectedAt).toISOString() : null,
      connectionDurationMs: this.connectedAt !== null ? Date.now() - this.connectedAt : 0,
    };
  }

  private notify(): void {
    if (this.listeners.size === 0) return;
    const snapshot = this.snapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
