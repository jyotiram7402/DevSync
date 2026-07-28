import type { AuthError } from "@supabase/supabase-js";

import { absoluteUrl } from "@/lib/auth/redirect";
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

function mapAuthError(error: AuthError): ActionError {
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

  // Developer diagnostic (message only — never secrets/content).
  // eslint-disable-next-line no-console
  console.error("[auth] Unhandled auth error:", message);
  return { code: "INTERNAL", message: "Something went wrong. Please try again." };
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
    options: { emailRedirectTo: callbackUrl("/") },
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
    options: { emailRedirectTo: callbackUrl("/"), shouldCreateUser: true },
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
