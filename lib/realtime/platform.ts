/**
 * RealtimePlatform — the composition root and application-facing facade.
 *
 * Wires the layers together and exposes them behind one object:
 *
 *   Application → RealtimePlatform
 *                   ├─ events (EventBus)        typed pub/sub
 *                   ├─ router (EventRouter)     wire → bus (validate/dedupe)
 *                   ├─ registry (EventRegistry) schema/versioning
 *                   ├─ subscriptions           logical subs (dedupe/priority)
 *                   ├─ channels                channel pooling/reuse
 *                   ├─ connection              status + lifecycle + auth
 *                   ├─ presence helpers
 *                   ├─ metrics / logger        observability (internal)
 *                   └─ latency probe (opt-in)
 *
 * Business features consume this instead of touching Supabase Realtime.
 */
import { REALTIME_TIMING } from "@/lib/realtime/constants";
import { ConnectionManager } from "@/lib/realtime/connection";
import { ChannelManager } from "@/lib/realtime/channel-manager";
import { createDefaultRegistry, EventRegistry } from "@/lib/realtime/event-registry";
import { EventBus } from "@/lib/realtime/event-bus";
import { EventRouter } from "@/lib/realtime/event-router";
import { Heartbeat } from "@/lib/realtime/heartbeat";
import { createLogger, type RealtimeLogger } from "@/lib/realtime/logger";
import { MetricsCollector } from "@/lib/realtime/metrics";
import { PresenceTracker } from "@/lib/realtime/presence";
import { SubscriptionManager } from "@/lib/realtime/subscription-manager";
import type { PresencePayload, RealtimeChannel } from "@/lib/realtime/types";
import type { TypedSupabaseClient } from "@/lib/supabase/types";

function newClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readPingTimestamp(payload: unknown): number | null {
  if (typeof payload !== "object" || payload === null) return null;
  const inner = (payload as { payload?: unknown }).payload;
  if (typeof inner !== "object" || inner === null) return null;
  const t = (inner as { t?: unknown }).t;
  return typeof t === "number" ? t : null;
}

export class RealtimePlatform {
  readonly logger: RealtimeLogger;
  readonly metrics: MetricsCollector;
  readonly connection: ConnectionManager;
  readonly channels: ChannelManager;
  readonly subscriptions: SubscriptionManager;
  readonly events: EventBus;
  readonly registry: EventRegistry;
  readonly router: EventRouter;

  private readonly clientId = newClientId();
  private readonly latencyChannelName = `system:${this.clientId}`;
  private readonly latencyHeartbeat: Heartbeat;
  private latencyChannel: RealtimeChannel | null = null;
  private latencyRefs = 0;
  private started = false;

  constructor(private readonly client: TypedSupabaseClient) {
    this.logger = createLogger("platform");
    this.metrics = new MetricsCollector();
    this.connection = new ConnectionManager(client, this.metrics, this.logger.child("connection"));
    this.channels = new ChannelManager(
      client,
      this.connection,
      this.metrics,
      this.logger.child("channels"),
    );
    this.subscriptions = new SubscriptionManager(
      this.channels,
      this.connection,
      this.metrics,
      this.logger.child("subscriptions"),
    );
    this.events = new EventBus();
    this.registry = createDefaultRegistry();
    this.router = new EventRouter(this.events, this.registry, this.metrics, this.logger.child("router"));
    this.latencyHeartbeat = new Heartbeat({
      intervalMs: REALTIME_TIMING.latencyProbeIntervalMs,
      onTick: () => this.sendPing(),
    });
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    this.connection.start();
    this.logger.info("platform started");
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    this.latencyHeartbeat.stop();
    this.latencyChannel = null;
    this.latencyRefs = 0;
    this.subscriptions.removeAll();
    this.channels.removeAll();
    this.router.reset();
    this.events.clear();
    this.connection.stop();
    this.logger.info("platform stopped");
  }

  setAuth(token: string | null): void {
    this.connection.setAuth(token);
  }

  /**
   * Attach a presence tracker to a channel. Binds before subscribe and tracks
   * once SUBSCRIBED. Returns a disposer that untracks and releases the channel.
   */
  createPresence<T extends PresencePayload>(
    channelName: string,
    self: T,
    onSync: (members: T[]) => void,
  ): () => void {
    const { channel, isNew } = this.channels.acquire(channelName, {
      config: { presence: { key: self.userId } },
    });
    const tracker = new PresenceTracker<T>(channel, self);
    const off = tracker.onSync(onSync);

    if (isNew) {
      tracker.bind();
      channel.subscribe((status: string) => {
        this.connection.reportChannelStatus(status);
        if (status === "SUBSCRIBED") void tracker.track().catch(() => {});
      });
    } else {
      void tracker.track().catch(() => {});
    }

    return () => {
      off();
      void tracker.untrack().catch(() => {});
      this.channels.release(channelName);
    };
  }

  /* --- latency probe (opt-in) -------------------------------------------- */

  enableLatencyProbe(): void {
    this.latencyRefs += 1;
    if (this.latencyRefs > 1) return;
    if (typeof window === "undefined") return;

    const { channel, isNew } = this.channels.acquire(this.latencyChannelName, {
      config: { broadcast: { self: true } },
    });
    this.latencyChannel = channel;
    if (isNew) {
      channel.on("broadcast", { event: "ping" }, (payload: unknown) => {
        const sentAt = readPingTimestamp(payload);
        if (sentAt !== null) this.metrics.recordLatency(Date.now() - sentAt);
      });
      channel.subscribe((status: string) => this.connection.reportChannelStatus(status));
    }
    this.latencyHeartbeat.start();
  }

  disableLatencyProbe(): void {
    if (this.latencyRefs === 0) return;
    this.latencyRefs -= 1;
    if (this.latencyRefs > 0) return;

    this.latencyHeartbeat.stop();
    if (this.latencyChannel) {
      this.channels.release(this.latencyChannelName);
      this.latencyChannel = null;
    }
  }

  private sendPing(): void {
    const channel = this.latencyChannel;
    if (!channel) return;
    try {
      void channel.send({ type: "broadcast", event: "ping", payload: { t: Date.now() } }).catch(() => {});
    } catch {
      // Best-effort probe — ignore transient send failures.
    }
  }
}

export function createRealtimePlatform(client: TypedSupabaseClient): RealtimePlatform {
  return new RealtimePlatform(client);
}
