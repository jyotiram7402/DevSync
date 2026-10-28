import { DEFAULT_AUTHENTICATED_REDIRECT, sanitizeRedirect } from "@/lib/auth/redirect";

/**
 * Email links (sign-up confirmation, password reset, magic link, email change,
 * invite) land on /auth/confirm with a one-time `token_hash`. Pure and
 * client-safe: shared by the confirm page and its server action.
 *
 * Our own closed list of link types: Supabase's `EmailOtpType` also accepts any
 * string, which would make per-type lookups possibly undefined. Every member
 * here is a valid `EmailOtpType` for `verifyOtp`.
 */
export type EmailLinkType = "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email";

const EMAIL_LINK_TYPES: readonly string[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] satisfies readonly EmailLinkType[];

export function isEmailLinkType(value: string): value is EmailLinkType {
  return EMAIL_LINK_TYPES.includes(value);
}

/** Where a verified link continues to. Password resets always go to the new-password form. */
export function emailLinkDestination(type: EmailLinkType, next: string | null): string {
  if (type === "recovery") return "/reset-password";
  return sanitizeRedirect(next, DEFAULT_AUTHENTICATED_REDIRECT);
}

/** Where a failed link sends the user to try again. */
export function emailLinkFailurePath(type: EmailLinkType | null): string {
  return type === "recovery" ? "/forgot-password" : "/login";
}

const CONFIRM_EMAIL = {
  title: "Confirm your email",
  description: "Confirm your email address to finish signing in.",
  action: "Confirm email",
  pending: "Confirming…",
};

/** Copy for the confirmation screen, per link type. */
export const EMAIL_LINK_COPY: Record<
  EmailLinkType,
  { title: string; description: string; action: string; pending: string }
> = {
  signup: CONFIRM_EMAIL,
  email: CONFIRM_EMAIL,
  magiclink: CONFIRM_EMAIL,
  recovery: {
    title: "Reset your password",
    description: "Continue to choose a new password for your account.",
    action: "Continue",
    pending: "Checking link…",
  },
  email_change: {
    title: "Confirm your new email",
    description: "Confirm this address to finish changing your account email.",
    action: "Confirm new email",
    pending: "Confirming…",
  },
  invite: {
    title: "Accept your invite",
    description: "Continue to set up your CopyAnywhere account.",
    action: "Accept invite",
    pending: "Checking invite…",
  },
};
