/**
 * Realtime logger (internal, observability only).
 *
 * A tiny leveled logger namespaced per subsystem. Disabled by default; enabled
 * via NEXT_PUBLIC_REALTIME_DEBUG=1 or at runtime. Never logs secrets or full
 * payloads — callers pass only ids, counts, and status strings.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function envEnabled(): boolean {
  return (
    typeof process !== "undefined" &&
    typeof process.env !== "undefined" &&
    process.env.NEXT_PUBLIC_REALTIME_DEBUG === "1"
  );
}

export class RealtimeLogger {
  private enabled: boolean;
  private minLevel: LogLevel = "debug";

  constructor(
    private readonly namespace: string,
    enabled: boolean = envEnabled(),
  ) {
    this.enabled = enabled;
  }

  child(sub: string): RealtimeLogger {
    return new RealtimeLogger(`${this.namespace}:${sub}`, this.enabled);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.write("debug", message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.write("info", message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.write("warn", message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.write("error", message, data);
  }

  private write(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!this.enabled || LEVEL_WEIGHT[level] < LEVEL_WEIGHT[this.minLevel]) return;
    const prefix = `[realtime:${this.namespace}]`;
    // eslint-disable-next-line no-console
    const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    if (data) {
      sink(prefix, message, data);
    } else {
      sink(prefix, message);
    }
  }
}

export function createLogger(namespace: string, enabled?: boolean): RealtimeLogger {
  return new RealtimeLogger(namespace, enabled);
}
