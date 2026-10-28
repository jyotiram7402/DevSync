import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Set a new password",
};

/**
 * New-password form. A valid reset link signs the user in (via /auth/confirm
 * or /auth/callback) before landing here; without that session the form could
 * only fail, so ask for a new link instead.
 */
export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured) {
    return (
      <AuthLayout>
        <AuthCard title="Set a new password" description="Choose a new password for your account">
          <AuthUnavailable />
        </AuthCard>
      </AuthLayout>
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AuthLayout>
        <AuthCard
          title="This reset link has expired"
          description="Reset links work once and for a limited time. Ask for a new one and open it from the email."
          footer={
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          }
        >
          <Button asChild>
            <Link href="/forgot-password">Send a new reset link</Link>
          </Button>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard title="Set a new password" description="Choose a new password for your account">
        <ResetPasswordForm />
      </AuthCard>
    </AuthLayout>
  );
}
