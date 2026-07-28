/** Public build-time configuration (anon key only — RLS is the boundary). */
export const CONFIG = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  devsyncUrl: process.env.EXPO_PUBLIC_DEVSYNC_URL ?? "https://devsync.app",
} as const;

export function isConfigured(): boolean {
  return Boolean(CONFIG.supabaseUrl && CONFIG.anonKey);
}

export function dashboardUrl(path = "/dashboard"): string {
  const base = CONFIG.devsyncUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
