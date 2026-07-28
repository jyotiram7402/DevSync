import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "Set a new password",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard title="Set a new password" description="Choose a new password for your account">
        {isSupabaseConfigured ? <ResetPasswordForm /> : <AuthUnavailable />}
      </AuthCard>
    </AuthLayout>
  );
}
