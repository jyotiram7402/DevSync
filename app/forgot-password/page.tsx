import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
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
        {isSupabaseConfigured ? <ForgotPasswordForm /> : <AuthUnavailable />}
      </AuthCard>
    </AuthLayout>
  );
}
