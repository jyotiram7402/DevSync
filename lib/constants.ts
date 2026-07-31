import { env } from "@/lib/env";

/**
 * Application-wide constants.
 *
 * Central, typed home for brand strings and canonical URLs used across
 * metadata, UI, and links. Values that depend on the environment are sourced
 * from the validated `env` loader so there is a single source of truth.
 */
export const APP_NAME = "CopyAnywhere" as const;

export const APP_TAGLINE = "Copy Once. Access Anywhere." as const;

export const APP_DESCRIPTION =
  "CopyAnywhere instantly synchronizes text, code, images, documents, files and links across your devices in real time — from Android to web, from browser to desktop. Stop emailing yourself." as const;

/** Short value proposition for compact places (OG cards, footer, manifest). */
export const APP_PITCH =
  "Realtime cross-device sync for text, code, images, documents and files." as const;

/** Canonical, absolute site URL (falls back to localhost in development). */
export const SITE_URL = env.siteUrl;
