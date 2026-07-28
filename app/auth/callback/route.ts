import { NextResponse } from "next/server";

import { sanitizeRedirect } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * OAuth / email-link callback.
 *
 * Exchanges the authorization code for a session (setting session cookies) and
 * redirects to a SANITIZED internal `next` path. Provider errors, a missing
 * code, or an unconfigured backend redirect back to /login with a safe error
 * code that the login page maps to a friendly message.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirect(searchParams.get("next"));
  const providerError = searchParams.get("error");

  const redirectToLogin = (reason: string): NextResponse =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);

  if (providerError) return redirectToLogin("oauth_cancelled");
  if (!code) return redirectToLogin("missing_code");
  if (!isSupabaseConfigured) return redirectToLogin("not_configured");

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return redirectToLogin("auth_callback_failed");
  } catch {
    return redirectToLogin("auth_callback_failed");
  }

  return NextResponse.redirect(`${origin}${next}`);
}
