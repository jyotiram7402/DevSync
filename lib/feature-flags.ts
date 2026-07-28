/**
 * Feature flags.
 *
 * A single, typed registry of product capabilities. Everything is disabled in
 * the foundation and each flag is flipped on in the sprint that ships it. This
 * lets us merge incomplete work behind a flag while keeping `main` deployable
 * (see docs/architecture/13-Git-Strategy.md).
 */
export const featureFlags = {
  auth: false,
  projects: false,
  snippets: false,
  realtime: false,
  search: false,
  devices: false,
  sharing: false,
  collections: false,
  notifications: false,
  analytics: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

/** Returns whether a given feature is currently enabled. */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
