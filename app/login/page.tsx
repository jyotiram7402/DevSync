import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "Sign in",
};

// A Map, so a crafted ?error=constructor can't reach Object.prototype.
const ERROR_MESSAGES = new Map<string, string>([
  ["oauth_cancelled", "Sign-in was cancelled. Please try again."],
  [
    "auth_callback_failed",
    "We couldn't finish signing you in from that link. If you were confirming your email, it's confirmed now — sign in below.",
  ],
  ["missing_code", "That sign-in link was incomplete. Please try again."],
  [
    "link_expired",
    "That link has expired or was already used. Sign in below, or sign up again with the same email to get a new confirmation email.",
  ],
  ["invalid_link", "That link didn't work. Sign in below, or ask for a new email."],
  ["not_configured", "Sign-in isn't set up on this site yet."],
]);

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const errorCode = typeof params.error === "string" ? params.error : undefined;
  const initialError = errorCode
    ? (ERROR_MESSAGES.get(errorCode) ?? "Something went wrong. Please try again.")
    : undefined;
  // Keep where they were going (e.g. a room invite) when they switch to sign-up.
  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to your CopyAnywhere account"
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link href={signupHref} className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign up
            </Link>
          </>
        }
      >
        {isSupabaseConfigured ? (
          <LoginForm next={next} initialError={initialError} />
        ) : (
          <AuthUnavailable />
        )}
      </AuthCard>
    </AuthLayout>
  );
}
