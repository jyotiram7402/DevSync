import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { SignupForm } from "@/components/auth/signup-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "Create account",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        description="Copy on one device, paste on any other. Free, in any browser."
        footer={
          <>
            Already have an account?{" "}
            <Link href={loginHref} className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        {isSupabaseConfigured ? <SignupForm next={next} /> : <AuthUnavailable />}
      </AuthCard>
    </AuthLayout>
  );
}
