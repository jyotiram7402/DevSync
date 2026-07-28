/**
 * Shown on auth screens when Supabase is not yet configured, so the app still
 * renders gracefully (rather than throwing) before environment variables are
 * set. Replaced by the real form once configured.
 */
export function AuthUnavailable() {
  return (
    <p className="text-center text-sm text-muted-foreground">
      Authentication is not configured yet. Set the Supabase environment variables to enable sign
      in.
    </p>
  );
}
