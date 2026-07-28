import { env } from "@/lib/env";

/**
 * Route lists and CSRF-safe redirect helpers.
 *
 * Pure and client-safe: consumed by the middleware, the OAuth callback, server
 * guards, and client forms. Centralizing route classification keeps auth
 * behavior consistent everywhere.
 */
export const LOGIN_ROUTE = "/login";
export const DEFAULT_AUTHENTICATED_REDIRECT = "/";

/** Routes an authenticated user should be redirected away from. */
export const AUTH_ROUTES: readonly string[] = ["/login", "/signup", "/forgot-password"];

/** Prefixes that require authentication (populated as protected areas ship). */
export const PROTECTED_PREFIXES: readonly string[] = [
  "/app",
  "/dashboard",
  "/settings",
  "/projects",
  "/snippets",
  "/devices",
  "/collections",
];

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Returns a safe internal redirect path, or the fallback. Rejects anything
 * that is not a same-origin relative path (absolute URLs, protocol-relative
 * `//`, schemes, and backslashes) to prevent open-redirect attacks.
 */
export function sanitizeRedirect(
  next: string | null | undefined,
  fallback: string = DEFAULT_AUTHENTICATED_REDIRECT,
): string {
  if (typeof next !== "string" || next.length === 0) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.includes("\\") || next.includes("://")) return fallback;
  return next;
}

/** Origin to build absolute callback URLs from (real origin on the client). */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return env.siteUrl;
}

export function absoluteUrl(path: string): string {
  return new URL(path, getBaseUrl()).toString();
}
