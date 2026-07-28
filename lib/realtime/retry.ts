/**
 * Generic async retry runner built on the backoff primitive.
 *
 * Re-exports `computeBackoff`/`BackoffOptions` from ./backoff so existing
 * importers (e.g. the Supabase browser client) keep a stable path while the
 * backoff math lives in one place.
 */
import { computeBackoff, type BackoffOptions } from "@/lib/realtime/backoff";

export { computeBackoff } from "@/lib/realtime/backoff";
export type { BackoffOptions } from "@/lib/realtime/backoff";

export interface RetryOptions extends BackoffOptions {
  /** Maximum attempts before giving up (default 5). */
  maxAttempts?: number;
  /** Abort between attempts. */
  signal?: AbortSignal;
  /** Decide whether a given error is retryable (default: always). */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Observe each scheduled retry (for logging/metrics). */
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
}

class AbortError extends Error {
  constructor() {
    super("Retry aborted.");
    this.name = "AbortError";
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AbortError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new AbortError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Run `fn` (receiving the zero-based attempt index) with exponential-backoff
 * retries. Rejects with the last error once attempts are exhausted, or with an
 * AbortError if the signal fires.
 */
export async function retryAsync<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 5);
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (options.signal?.aborted) throw new AbortError();
    try {
      // Sequential by design — each attempt waits for the previous to fail.
      // eslint-disable-next-line no-await-in-loop
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const isLast = attempt === maxAttempts - 1;
      const retryable = options.shouldRetry ? options.shouldRetry(error, attempt) : true;
      if (isLast || !retryable) break;

      const delay = computeBackoff(attempt, options);
      options.onRetry?.(attempt, delay, error);
      // eslint-disable-next-line no-await-in-loop
      await wait(delay, options.signal);
    }
  }

  throw lastError;
}
