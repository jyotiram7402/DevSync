/**
 * SubscriptionManager — the registry of logical subscriptions.
 *
 * Responsibilities (single):
 *   • De-duplicate: identical `key`s share one underlying channel (ref-counted).
 *   • Apply bindings (postgres_changes / broadcast / presence) to a channel and
 *     subscribe once, feeding subscribe-status back to the ConnectionManager.
 *   • Track priorities and expose the active count for metrics.
 *   • Recover: on resume, Supabase auto-rejoins the socket's channels; presence
 *     re-tracking is delegated to presence consumers via the resume signal.
 *
 * It sits above the ChannelManager and never talks to Supabase directly except
 * through an acquired channel's binding/subscribe API.
 */
import type { ChannelManager } from "@/lib/realtime/channel-manager";
import type { ConnectionManager } from "@/lib/realtime/connection";
import type { RealtimeLogger } from "@/lib/realtime/logger";
import type { MetricsCollector } from "@/lib/realtime/metrics";
import type {
  ChannelBinding,
  RealtimeChannel,
  SubscriptionDescriptor,
} from "@/lib/realtime/types";

interface SubscriptionEntry {
  descriptor: SubscriptionDescriptor;
  channelName: string;
  refCount: number;
}

/**
 * Minimal structural view of the channel's binding API. Casting to this keeps
 * us independent of @supabase/supabase-js's exact `.on` overload identifiers
 * (consistent with lib/realtime/types deriving channel types structurally) and
 * avoids overload-resolution friction with union-typed event names.
 */
interface BindableChannel {
  on(type: string, filter: object, callback: (payload: unknown) => void): unknown;
}

function applyBinding(channel: RealtimeChannel, binding: ChannelBinding): void {
  const bindable = channel as unknown as BindableChannel;
  switch (binding.type) {
    case "postgres_changes":
      bindable.on("postgres_changes", binding.filter, (payload) => binding.handler(payload));
      break;
    case "broadcast":
      bindable.on("broadcast", { event: binding.event }, (payload) => binding.handler(payload));
      break;
    case "presence":
      bindable.on("presence", { event: binding.event }, () => binding.handler());
      break;
    default:
      break;
  }
}

export class SubscriptionManager {
  private readonly entries = new Map<string, SubscriptionEntry>();

  constructor(
    private readonly channels: ChannelManager,
    private readonly connection: ConnectionManager,
    private readonly metrics: MetricsCollector,
    private readonly logger: RealtimeLogger,
  ) {}

  /**
   * Register a subscription. Duplicate keys increment a ref count and share the
   * channel (duplicate-subscription prevention). Returns a disposer.
   */
  subscribe(descriptor: SubscriptionDescriptor): () => void {
    const existing = this.entries.get(descriptor.key);
    if (existing) {
      existing.refCount += 1;
      return () => this.unsubscribe(descriptor.key);
    }

    const { channel, isNew } = this.channels.acquire(descriptor.channelName, descriptor.channelOptions);
    if (isNew) {
      for (const binding of descriptor.bindings) applyBinding(channel, binding);
      channel.subscribe((status: string) => {
        this.connection.reportChannelStatus(status);
        descriptor.onStatus?.(status);
      });
    }

    this.entries.set(descriptor.key, {
      descriptor,
      channelName: descriptor.channelName,
      refCount: 1,
    });
    this.metrics.setSubscriptionCount(this.entries.size);
    this.logger.debug("subscribed", { key: descriptor.key, priority: descriptor.priority ?? "normal" });
    return () => this.unsubscribe(descriptor.key);
  }

  unsubscribe(key: string): void {
    const entry = this.entries.get(key);
    if (!entry) return;

    entry.refCount -= 1;
    if (entry.refCount > 0) return;

    this.entries.delete(key);
    this.channels.release(entry.channelName);
    this.metrics.setSubscriptionCount(this.entries.size);
    this.logger.debug("unsubscribed", { key });
  }

  has(key: string): boolean {
    return this.entries.has(key);
  }

  count(): number {
    return this.entries.size;
  }

  removeAll(): void {
    for (const entry of this.entries.values()) {
      this.channels.release(entry.channelName);
    }
    this.entries.clear();
    this.metrics.setSubscriptionCount(0);
  }
}
