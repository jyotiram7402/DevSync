/**
 * PresenceTracker — thin wrapper over a channel's presence API.
 *
 * Single responsibility: attach presence bindings, expose the synced member
 * list, and track/untrack this client's own payload. Channel lifecycle
 * (acquire/subscribe/release) is owned by the ChannelManager/SubscriptionManager
 * — this only manages presence state on an already-acquired channel.
 */
import type { PresencePayload, RealtimeChannel } from "@/lib/realtime/types";

export type PresenceListener<T extends PresencePayload> = (members: T[]) => void;

export class PresenceTracker<T extends PresencePayload> {
  private members: T[] = [];
  private readonly listeners = new Set<PresenceListener<T>>();

  constructor(
    private readonly channel: RealtimeChannel,
    private readonly self: T,
  ) {}

  /** Register the presence sync binding. Call once, before the channel subscribes. */
  bind(): void {
    this.channel.on("presence", { event: "sync" }, () => {
      const state = this.channel.presenceState<T>();
      this.members = Object.values(state).flat();
      for (const listener of this.listeners) listener(this.members);
    });
  }

  onSync(listener: PresenceListener<T>): () => void {
    this.listeners.add(listener);
    listener(this.members);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Announce this client's presence. Call after the channel is SUBSCRIBED. */
  async track(): Promise<void> {
    await this.channel.track(this.self);
  }

  async untrack(): Promise<void> {
    await this.channel.untrack();
  }

  getMembers(): T[] {
    return this.members;
  }
}
