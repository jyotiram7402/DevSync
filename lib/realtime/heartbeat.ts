/**
 * Heartbeat — a small, cancellable interval ticker.
 *
 * Generic infrastructure used by the connection layer for keepalive/latency
 * probes. It does not know what a "tick" means; it just fires on schedule and
 * can detect a missed acknowledgement via `expect()`/`ack()`.
 */
export interface HeartbeatOptions {
  intervalMs: number;
  onTick: () => void;
  /** Called if an expected ack does not arrive within timeoutMs. */
  onTimeout?: () => void;
  timeoutMs?: number;
}

export class Heartbeat {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: HeartbeatOptions) {}

  get running(): boolean {
    return this.intervalId !== null;
  }

  start(): void {
    if (this.intervalId !== null) return;
    this.intervalId = setInterval(() => this.options.onTick(), this.options.intervalMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.clearExpectation();
  }

  /** Arm a timeout that fires `onTimeout` unless `ack()` is called first. */
  expect(): void {
    const { timeoutMs, onTimeout } = this.options;
    if (timeoutMs === undefined || onTimeout === undefined) return;
    this.clearExpectation();
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      onTimeout();
    }, timeoutMs);
  }

  /** Acknowledge a pending expectation (cancels the timeout). */
  ack(): void {
    this.clearExpectation();
  }

  private clearExpectation(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
