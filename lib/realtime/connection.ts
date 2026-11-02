/**
 * ConnectionManager — owns connection state and browser lifecycle.
 *
 * Responsibilities (single):
 *   • Aggregate per-channel subscribe-status strings into one ConnectionStatus.
 *   • Track network online/offline and document visibility (tab suspension),
 *     emitting `resume` when the app should recover (network back / tab shown).
 *     "Offline" is only believed once a real request fails too: browsers,
 *     especially on VPNs and office networks, sometimes report offline while
 *     the network works fine.
 *   • Prime the realtime socket auth token for RLS-protected channels.
 *   • Feed connection metrics (connect/reconnect counts, duration).
 *
 * It sits BELOW the channel manager and knows nothing about channels or events.
 */
import type { MetricsCollector } from "@/lib/realtime/metrics";
import type { RealtimeLogger } from "@/lib/realtime/logger";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { ConnectionStatus } from "@/lib/realtime/types";

type StatusListener = (status: ConnectionStatus) => void;
type OnlineListener = (online: boolean) => void;
type ResumeListener = () => void;

/** A small file on this site that the middleware skips; it only answers if the network really works. */
const PROBE_URL = "/robots.txt";
const PROBE_TIMEOUT_MS = 4_000;
/** While offline, check this often whether the network is back (the browser's own event can fail to fire). */
const OFFLINE_RECHECK_MS = 5_000;

async function networkAnswers(): Promise<boolean> {
  try {
    const response = await fetch(`${PROBE_URL}?t=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export class ConnectionManager {
  private status: ConnectionStatus = "idle";
  private online = true;
  private hasConnected = false;
  /** Bumped whenever a newer signal makes an in-flight network check irrelevant. */
  private probeSeq = 0;
  private recheckTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly statusListeners = new Set<StatusListener>();
  private readonly onlineListeners = new Set<OnlineListener>();
  private readonly resumeListeners = new Set<ResumeListener>();

  private handleOnline?: () => void;
  private handleOffline?: () => void;
  private handleVisibility?: () => void;

  constructor(
    private readonly client: TypedSupabaseClient,
    private readonly metrics: MetricsCollector,
    private readonly logger: RealtimeLogger,
  ) {}

  /* --- status ------------------------------------------------------------ */

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isOnline(): boolean {
    return this.online;
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  onOnlineChange(listener: OnlineListener): () => void {
    this.onlineListeners.add(listener);
    return () => {
      this.onlineListeners.delete(listener);
    };
  }

  /** Fired when the app should recover subscriptions (network back / tab shown). */
  onResume(listener: ResumeListener): () => void {
    this.resumeListeners.add(listener);
    return () => {
      this.resumeListeners.delete(listener);
    };
  }

  private setStatus(next: ConnectionStatus): void {
    if (this.status === next) return;
    this.status = next;
    if (next === "connected") {
      this.metrics.markConnected(this.hasConnected);
      this.hasConnected = true;
    } else if (next === "disconnected" || next === "idle") {
      this.metrics.markDisconnected();
    }
    for (const listener of this.statusListeners) listener(next);
  }

  /** Map a channel subscribe-status string into the aggregate status. */
  reportChannelStatus(raw: string): void {
    switch (raw) {
      case "SUBSCRIBED":
        this.setStatus("connected");
        break;
      case "TIMED_OUT":
        this.setStatus("reconnecting");
        break;
      case "CHANNEL_ERROR":
        this.setStatus("error");
        break;
      case "CLOSED":
        this.setStatus("disconnected");
        break;
      default:
        break;
    }
  }

  /** No channels remain — return to idle. */
  notifyIdle(): void {
    this.setStatus("idle");
  }

  /* --- auth -------------------------------------------------------------- */

  setAuth(token: string | null): void {
    void this.client.realtime.setAuth(token);
  }

  /* --- lifecycle --------------------------------------------------------- */

  start(): void {
    if (typeof window === "undefined") return;
    this.online = true;

    this.handleOnline = () => {
      this.logger.info("network online");
      this.probeSeq += 1;
      this.clearRecheck();
      this.setOnline(true);
      this.emitResume();
    };
    this.handleOffline = () => {
      // Live updates do stop here; "offline" itself is only reported once a
      // request fails as well.
      this.logger.info("browser reports offline — checking");
      this.setStatus("disconnected");
      void this.confirmOffline();
    };
    this.handleVisibility = () => {
      if (document.visibilityState === "visible" && this.online) {
        this.logger.debug("tab visible — resume");
        this.emitResume();
      }
    };

    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
    document.addEventListener("visibilitychange", this.handleVisibility);

    if (!navigator.onLine) void this.confirmOffline();
  }

  stop(): void {
    if (typeof window === "undefined") return;
    if (this.handleOnline) window.removeEventListener("online", this.handleOnline);
    if (this.handleOffline) window.removeEventListener("offline", this.handleOffline);
    if (this.handleVisibility) {
      document.removeEventListener("visibilitychange", this.handleVisibility);
    }
    this.probeSeq += 1;
    this.clearRecheck();
    this.statusListeners.clear();
    this.onlineListeners.clear();
    this.resumeListeners.clear();
  }

  /* --- network checks ---------------------------------------------------- */

  /** The browser said "offline": believe it only if a request fails too. */
  private async confirmOffline(): Promise<void> {
    this.probeSeq += 1;
    const seq = this.probeSeq;
    const answers = await networkAnswers();
    if (seq !== this.probeSeq) return;
    if (answers) {
      this.logger.info("network answers — staying online");
      return;
    }
    this.setOnline(false);
    this.scheduleRecheck();
  }

  private scheduleRecheck(): void {
    this.clearRecheck();
    this.recheckTimer = setTimeout(() => {
      this.recheckTimer = null;
      void this.recheck();
    }, OFFLINE_RECHECK_MS);
  }

  private async recheck(): Promise<void> {
    if (this.online) return;
    this.probeSeq += 1;
    const seq = this.probeSeq;
    const answers = await networkAnswers();
    if (seq !== this.probeSeq || this.online) return;
    if (answers) {
      this.logger.info("network is back");
      this.setOnline(true);
      this.emitResume();
    } else {
      this.scheduleRecheck();
    }
  }

  private clearRecheck(): void {
    if (this.recheckTimer !== null) {
      clearTimeout(this.recheckTimer);
      this.recheckTimer = null;
    }
  }

  private setOnline(next: boolean): void {
    if (this.online === next) return;
    this.online = next;
    for (const listener of this.onlineListeners) listener(next);
  }

  private emitResume(): void {
    for (const listener of this.resumeListeners) listener();
  }
}
