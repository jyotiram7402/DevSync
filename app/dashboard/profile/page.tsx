import Link from "next/link";

import { UserAvatar } from "@/components/auth/user-avatar";
import { DashboardCard } from "@/components/shared/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getServerUser } from "@/lib/auth/session";

export const metadata = {
  title: "Profile",
};

const PROVIDERS = new Map<string, string>([
  ["google", "Google"],
  ["github", "GitHub"],
  ["email", "email and password"],
]);

export default async function ProfilePage() {
  const user = await getServerUser();
  const provider = user?.provider ? (PROVIDERS.get(user.provider) ?? user.provider) : null;
  const fromProvider = user?.provider === "google" || user?.provider === "github";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" description="Your account details." />
      <DashboardCard>
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar
            name={user?.displayName ?? user?.email ?? null}
            avatarUrl={user?.avatarUrl ?? null}
            className="size-12 text-base"
          />
          <div className="min-w-0">
            <p className="truncate text-base font-medium">{user?.displayName ?? "Your account"}</p>
            {user?.email ? <p className="truncate text-sm text-muted-foreground">{user.email}</p> : null}
            {provider ? <p className="mt-1 text-xs text-muted-foreground">Signed in with {provider}</p> : null}
          </div>
        </div>
        {fromProvider && provider ? (
          <p className="mt-6 max-w-prose text-sm text-muted-foreground">
            Your name and picture come from your {provider} account. Change them there and they update here the next
            time you sign in.
          </p>
        ) : null}
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/dashboard/settings">Settings</Link>
          </Button>
        </div>
      </DashboardCard>
    </div>
  );
}
