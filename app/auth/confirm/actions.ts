"use server";

import { redirect } from "next/navigation";

import { emailLinkDestination, emailLinkFailurePath, isEmailLinkType } from "@/lib/auth/email-links";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Verifies a one-time email link on the server, which sets the session
 * cookies, then continues to where the link was meant to go.
 *
 * Verifying with the `token_hash` (instead of exchanging a PKCE code) works in
 * any browser or app, not only the one that asked for the email. It runs on a
 * button press, never on page load, so email security scanners that open links
 * can't use up the token before the user does.
 */
export async function confirmEmailLink(formData: FormData): Promise<void> {
  const tokenHash = formData.get("token_hash");
  const type = formData.get("type");
  const next = formData.get("next");

  if (typeof type !== "string" || !isEmailLinkType(type)) {
    redirect(`${emailLinkFailurePath(null)}?error=invalid_link`);
  }
  const failurePath = emailLinkFailurePath(type);

  if (typeof tokenHash !== "string" || tokenHash.length === 0) {
    redirect(`${failurePath}?error=invalid_link`);
  }
  if (!isSupabaseConfigured) {
    redirect(`${failurePath}?error=not_configured`);
  }

  let failure: string | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) failure = error.code === "otp_expired" ? "link_expired" : "invalid_link";
  } catch {
    failure = "invalid_link";
  }

  // redirect() works by throwing, so it stays outside the try/catch.
  if (failure) redirect(`${failurePath}?error=${failure}`);
  redirect(emailLinkDestination(type, typeof next === "string" ? next : null));
}
