import type { AuthError } from "@supabase/supabase-js";

import { absoluteUrl, DEFAULT_AUTHENTICATED_REDIRECT } from "@/lib/auth/redirect";
import type {
  ForgotPasswordInput,
  LoginInput,
  MagicLinkInput,
  ResetPasswordInput,
  SignupInput,
} from "@/lib/auth/schemas";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { ActionError, ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";
import type { OAuthProvider } from "@/types/auth";

/**
 * Reusable auth operations over the Supabase browser client.
 *
 * Each takes a client and returns the typed `ActionResult` contract, mapping
 * Supabase errors to safe, friendly messages. Performing auth on the browser
 * client means `onAuthStateChange` fires immediately, so the client session
 * state stays reactive (see providers/auth-provider.tsx). Supabase's Auth
 * server is the validating authority; inputs are additionally Zod-validated in
 * the forms for UX.
 */

const CALLBACK_PATH = "/auth/callback";

function callbackUrl(next: string): string {
  return absoluteUrl(`${CALLBACK_PATH}?next=${encodeURIComponent(next)}`);
}

const EXPIRED_LINK: ActionError = {
  code: "UNAUTHENTICATED",
  message: "Your link is invalid or has expired. Please request a new one.",
};

/**
 * Friendly messages keyed by Supabase Auth error code
 * (https://supabase.com/docs/guides/auth/debugging/error-codes). Codes are
 * stable, unlike message text, so they are checked first.
 */
const AUTH_ERROR_MESSAGES: Record<string, ActionError> = {
  invalid_credentials: { code: "UNAUTHENTICATED", message: "Incorrect email or password." },
  email_not_confirmed: {
    code: "FORBIDDEN",
    message: "Please confirm your email address before signing in. Check your inbox and spam folder.",
  },
  user_already_exists: {
    code: "CONFLICT",
    message: "An account with this email already exists. Try signing in instead.",
  },
  email_exists: {
    code: "CONFLICT",
    message: "An account with this email already exists. Try signing in instead.",
  },
  email_address_invalid: {
    code: "VALIDATION_FAILED",
    message:
      "This email address can't be used. Test addresses (like @example.com) are blocked — use a real email you can receive mail at.",
  },
  email_address_not_authorized: {
    code: "FORBIDDEN",
    message:
      "We can't send a confirmation email to this address yet. Please continue with Google or GitHub, or try again later.",
  },
  over_email_send_rate_limit: {
    code: "RATE_LIMITED",
    message: "Too many emails were sent recently. Please wait a few minutes and try again.",
  },
  over_request_rate_limit: {
    code: "RATE_LIMITED",
    message: "Too many attempts. Please wait a moment and try again.",
  },
  weak_password: {
    code: "VALIDATION_FAILED",
    message: "That password is too weak. Use a longer password with letters, numbers and symbols.",
  },
  same_password: {
    code: "VALIDATION_FAILED",
    message: "Your new password must be different from your current one.",
  },
  signup_disabled: { code: "FORBIDDEN", message: "New sign-ups are currently turned off." },
  email_provider_disabled: {
    code: "FORBIDDEN",
    message: "Email sign-up is turned off. Please continue with Google or GitHub.",
  },
  provider_disabled: { code: "FORBIDDEN", message: "That sign-in method isn't enabled yet." },
  otp_expired: EXPIRED_LINK,
  flow_state_expired: EXPIRED_LINK,
  flow_state_not_found: EXPIRED_LINK,
  session_not_found: EXPIRED_LINK,
};

function mapAuthError(error: AuthError): ActionError {
  const code = error.code ?? "";
  const known = AUTH_ERROR_MESSAGES[code];
  if (known) return known;

  // Supabase unreachable (offline, or blocked by a network filter).
  if (error.name === "AuthRetryableFetchError" || error.status === 0) {
    return {
      code: "NETWORK_ERROR",
      message: "Can't reach the server. Check your internet connection and try again.",
    };
  }

  // Fallback on message text for responses without a recognised code.
  const message = error.message ?? "";

  if (/invalid login credentials/i.test(message)) {
    return { code: "UNAUTHENTICATED", message: "Incorrect email or password." };
  }
  if (/email not confirmed/i.test(message)) {
    return {
      code: "FORBIDDEN",
      message: "Please confirm your email address before signing in.",
    };
  }
  if (/already registered/i.test(message)) {
    return { code: "CONFLICT", message: "An account with this email already exists." };
  }
  if (/auth session missing|session (not found|missing)/i.test(message)) {
    return {
      code: "UNAUTHENTICATED",
      message: "Your link is invalid or has expired. Please request a new one.",
    };
  }
  if (/rate limit|too many/i.test(message)) {
    return {
      code: "RATE_LIMITED",
      message: "Too many attempts. Please wait a moment and try again.",
    };
  }

  // Developer diagnostic (code/status/message only — never secrets/content).
  // eslint-disable-next-line no-console
  console.error("[auth] Unhandled auth error:", code || "(no code)", error.status ?? "", message);
  return {
    code: "INTERNAL",
    // The Supabase code is safe to show and makes support/debugging possible.
    message: code
      ? `Something went wrong (${code}). Please try again.`
      : "Something went wrong. Please try again.",
  };
}

export async function signInWithPassword(
  supabase: TypedSupabaseClient,
  values: LoginInput,
): Promise<ActionResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });
  if (error) return err(mapAuthError(error));
  return ok(undefined);
}

export async function signUpWithPassword(
  supabase: TypedSupabaseClient,
  values: SignupInput,
): Promise<ActionResult<{ needsEmailConfirmation: boolean }>> {
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: { emailRedirectTo: callbackUrl(DEFAULT_AUTHENTICATED_REDIRECT) },
  });
  if (error) return err(mapAuthError(error));
  return ok({ needsEmailConfirmation: data.session === null });
}

export async function requestPasswordReset(
  supabase: TypedSupabaseClient,
  values: ForgotPasswordInput,
): Promise<ActionResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
    redirectTo: callbackUrl("/reset-password"),
  });
  if (error) return err(mapAuthError(error));
  return ok(undefined);
}

export async function updatePassword(
  supabase: TypedSupabaseClient,
  values: ResetPasswordInput,
): Promise<ActionResult> {
  const { error } = await supabase.auth.updateUser({ password: values.password });
  if (error) return err(mapAuthError(error));
  return ok(undefined);
}

export async function signInWithMagicLink(
  supabase: TypedSupabaseClient,
  values: MagicLinkInput,
): Promise<ActionResult> {
  const { error } = await supabase.auth.signInWithOtp({
    email: values.email,
    options: { emailRedirectTo: callbackUrl(DEFAULT_AUTHENTICATED_REDIRECT), shouldCreateUser: true },
  });
  if (error) return err(mapAuthError(error));
  return ok(undefined);
}

export async function signInWithOAuth(
  supabase: TypedSupabaseClient,
  provider: OAuthProvider,
  next: string,
): Promise<ActionResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl(next) },
  });
  // On success the browser is redirected to the provider by the SDK.
  if (error) return err(mapAuthError(error));
  return ok(undefined);
}

export async function signOut(supabase: TypedSupabaseClient): Promise<ActionResult> {
  const { error } = await supabase.auth.signOut();
  if (error) return err(mapAuthError(error));
  return ok(undefined);
}
