/**
 * Reusable error strategy.
 *
 * A small hierarchy of typed error classes for INFRASTRUCTURE and INITIALIZATION
 * failures (environment, Supabase client construction, unexpected/network
 * failures at the edges). These are thrown to fail fast during setup.
 *
 * NOTE: This is distinct from the request/response error model. Server Actions
 * and Route Handlers return the typed `ActionResult` union (see types/api.ts)
 * and never throw across that boundary. These classes are for the layers below
 * that contract — client construction, env validation, and similar.
 *
 * Pure module: no side effects, no React, no Supabase — safe to import anywhere.
 */
export class DevSyncError extends Error {
  readonly code: string;

  constructor(message: string, code: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DevSyncError";
    this.code = code;
  }
}

/** Thrown when required environment variables are missing or malformed. */
export class EnvironmentError extends DevSyncError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, "ENVIRONMENT_ERROR", options);
    this.name = "EnvironmentError";
  }
}

/** Thrown when Supabase is used but not configured (missing URL/anon key). */
export class SupabaseConfigError extends DevSyncError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, "SUPABASE_CONFIG_ERROR", options);
    this.name = "SupabaseConfigError";
  }
}

/** Thrown for unexpected Supabase client or network failures. */
export class SupabaseError extends DevSyncError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, "SUPABASE_ERROR", options);
    this.name = "SupabaseError";
  }
}

/** Narrow an unknown thrown value to a DevSyncError. */
export function isDevSyncError(value: unknown): value is DevSyncError {
  return value instanceof DevSyncError;
}
