import { UserAvatar } from "@/components/auth/user-avatar";
import { DashboardCard } from "@/components/shared/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";
import { getServerUser } from "@/lib/auth/session";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await getServerUser();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" description="Your account details." />
      <DashboardCard>
        <div className="flex items-center gap-4">
          <UserAvatar name={user?.displayName ?? null} avatarUrl={user?.avatarUrl ?? null} className="size-12" />
          <div className="min-w-0">
            <p className="truncate text-base font-medium">{user?.displayName ?? "Your account"}</p>
            {user?.email ? (
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            ) : null}
            {user?.provider ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Signed in with {user.provider}
              </p>
            ) : null}
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Editing your profile arrives in an upcoming sprint.
        </p>
      </DashboardCard>
    </div>
  );
}
