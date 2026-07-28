/**
 * Build-time configuration (public values only — the anon key is safe because
 * RLS is the security boundary; no secrets ever live in the extension bundle).
 */
export const EXTENSION_CONFIG = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
  devsyncUrl: import.meta.env.VITE_DEVSYNC_URL ?? "https://devsync.app",
} as const;

export function isConfigured(): boolean {
  return Boolean(EXTENSION_CONFIG.supabaseUrl && EXTENSION_CONFIG.supabaseAnonKey);
}

export function dashboardUrl(path = "/dashboard"): string {
  const base = EXTENSION_CONFIG.devsyncUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
