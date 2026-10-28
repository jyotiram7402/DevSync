import { NextResponse } from "next/server";

import { sanitizeRedirect } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * OAuth / email-link callback (code exchange).
 *
 * Exchanges the authorization code for a session (setting session cookies) and
 * redirects to a SANITIZED internal `next` path. Used by Google/GitHub sign-in
 * and by email links still in the default Supabase format; the email templates
 * should link to /auth/confirm instead, because a code exchange only works in
 * the browser that asked for the email.
 *
 * Failures redirect with a safe error code that the page maps to a friendly
 * message: password-reset links go back to "Forgot password" (to request a new
 * one), everything else to sign-in.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirect(searchParams.get("next"));
  const providerError = searchParams.get("error");
  const providerErrorCode = searchParams.get("error_code");
  const isPasswordReset = next === "/reset-password";

  const fail = (reason: string): NextResponse =>
    NextResponse.redirect(
      `${origin}${isPasswordReset ? "/forgot-password" : "/login"}?error=${encodeURIComponent(reason)}`,
    );

  if (providerError) {
    // Expired or already-used email links arrive as error_code=otp_expired.
    if (providerErrorCode === "otp_expired") return fail("link_expired");
    return fail(isPasswordReset ? "invalid_link" : "oauth_cancelled");
  }
  if (!code) return fail(isPasswordReset ? "invalid_link" : "missing_code");
  if (!isSupabaseConfigured) return fail("not_configured");

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // Typically the link was opened in a different browser or app than the one
    // that asked for it. A sign-up confirmation is still confirmed by then.
    if (error) return fail(isPasswordReset ? "link_expired" : "auth_callback_failed");
  } catch {
    return fail(isPasswordReset ? "link_expired" : "auth_callback_failed");
  }

  return NextResponse.redirect(`${origin}${next}`);
}
