import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "Reset password",
};

/** Why the user was sent back here from a reset link (see /auth/confirm and /auth/callback). */
const ERROR_MESSAGES: Record<string, string> = {
  link_expired:
    "That reset link has expired, was already used, or was opened in a different browser. Enter your email to get a new one.",
  invalid_link: "That reset link didn't work. Enter your email to get a new one.",
  not_configured: "Authentication is not configured.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : undefined;
  const initialError = errorCode
    ? (ERROR_MESSAGES[errorCode] ?? "That reset link didn't work. Enter your email to get a new one.")
    : undefined;

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot your password?"
        description="Enter your email and we will send you a reset link"
        footer={
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        }
      >
        {isSupabaseConfigured ? <ForgotPasswordForm initialError={initialError} /> : <AuthUnavailable />}
      </AuthCard>
    </AuthLayout>
  );
}
