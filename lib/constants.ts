import { env } from "@/lib/env";

/**
 * Application-wide constants.
 *
 * Central, typed home for brand strings and canonical URLs used across
 * metadata, UI, and future links. Values that depend on the environment are
 * sourced from the validated `env` loader so there is a single source of truth.
 */
export const APP_NAME = "DevSync" as const;

export const APP_TAGLINE = "Copy Once. Debug Anywhere." as const;

export const APP_DESCRIPTION =
  "DevSync instantly syncs your errors, logs, and code snippets across all your devices — so you can copy on one machine and debug on another." as const;

/** Canonical, absolute site URL (falls back to localhost in development). */
export const SITE_URL = env.siteUrl;
