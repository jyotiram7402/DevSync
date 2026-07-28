import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { SignupForm } from "@/components/auth/signup-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        description="Start syncing your dev clipboard across devices"
        footer={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        {isSupabaseConfigured ? <SignupForm /> : <AuthUnavailable />}
      </AuthCard>
    </AuthLayout>
  );
}
