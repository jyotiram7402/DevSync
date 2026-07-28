/**
 * Exponential backoff (pure).
 *
 * The single source of truth for reconnect/retry delay math. Both the Supabase
 * realtime transport (via lib/supabase/browser) and the higher-level retry
 * runner depend on this. Dependency-free and deterministic apart from jitter.
 */
export interface BackoffOptions {
  baseMs?: number;
  maxMs?: number;
  factor?: number;
  /** Subtract up to 20% random jitter (default true) to avoid thundering herds. */
  jitter?: boolean;
}

const DEFAULT_BASE_MS = 1000;
const DEFAULT_MAX_MS = 30000;
const DEFAULT_FACTOR = 2;

/** Delay (ms) for a zero-based attempt number. */
export function computeBackoff(attempt: number, options: BackoffOptions = {}): number {
  const base = options.baseMs ?? DEFAULT_BASE_MS;
  const max = options.maxMs ?? DEFAULT_MAX_MS;
  const factor = options.factor ?? DEFAULT_FACTOR;

  const raw = Math.min(max, base * Math.pow(factor, Math.max(0, attempt)));

  if (options.jitter === false) {
    return Math.round(raw);
  }
  const jitter = raw * 0.2 * Math.random();
  return Math.round(raw - jitter);
}

/**
 * Stateful backoff cursor. Tracks the attempt count so callers do not have to;
 * `next()` advances and returns the delay, `reset()` returns to the start.
 */
export class Backoff {
  private attempt = 0;

  constructor(private readonly options: BackoffOptions = {}) {}

  next(): number {
    const delay = computeBackoff(this.attempt, this.options);
    this.attempt += 1;
    return delay;
  }

  peek(): number {
    return computeBackoff(this.attempt, this.options);
  }

  reset(): void {
    this.attempt = 0;
  }

  get attempts(): number {
    return this.attempt;
  }
}
