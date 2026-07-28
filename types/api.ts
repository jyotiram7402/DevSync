/**
 * API result contract.
 *
 * Every Server Action and Route Handler returns a typed, discriminated result
 * instead of throwing across the boundary. Callers branch on the stable
 * machine-readable `code`, never on message text, and TypeScript forces them
 * to handle the failure case. See docs/architecture/08-API-Strategy.md and
 * 09-Error-Handling.md.
 */
export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_FAILED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "REALTIME_DISCONNECTED"
  | "INTERNAL";

export interface ActionError {
  /** Stable, machine-readable error identifier. */
  code: ErrorCode;
  /** Safe, user-appropriate message. Never contains internal details. */
  message: string;
  /** Optional per-field validation messages for form rendering. */
  fieldErrors?: Record<string, string[]>;
}

export type ActionSuccess<T> = { ok: true; data: T };
export type ActionFailure = { ok: false; error: ActionError };

export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure;

/** Build a success result. */
export function ok<T>(data: T): ActionSuccess<T> {
  return { ok: true, data };
}

/** Build a failure result. */
export function err(error: ActionError): ActionFailure {
  return { ok: false, error };
}
