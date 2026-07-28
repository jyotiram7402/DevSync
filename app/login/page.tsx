import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "Sign in",
};

const ERROR_MESSAGES: Record<string, string> = {
  oauth_cancelled: "Sign-in was cancelled. Please try again.",
  auth_callback_failed: "We could not sign you in. Please try again.",
  missing_code: "That sign-in link was invalid. Please try again.",
  not_configured: "Authentication is not configured.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const errorCode = typeof params.error === "string" ? params.error : undefined;
  const initialError = errorCode
    ? (ERROR_MESSAGES[errorCode] ?? "Something went wrong. Please try again.")
    : undefined;

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to your DevSync account"
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
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
