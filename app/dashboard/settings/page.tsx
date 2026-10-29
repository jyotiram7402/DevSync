import { Mail } from "lucide-react";
import Link from "next/link";

import { UserAvatar } from "@/components/auth/user-avatar";
import { InstallAppButton } from "@/components/pwa/install-button";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getDashboardOverview } from "@/features/dashboard/services/overview-service";
import { DeviceList } from "@/features/settings/components/device-list";
import { SettingsSection } from "@/features/settings/components/settings-section";
import { SignOutButton } from "@/features/settings/components/sign-out-button";
import { ThemeSetting } from "@/features/settings/components/theme-setting";
import { getServerUser } from "@/lib/auth/session";
import { SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata = {
  title: "Settings",
};

const PROVIDERS = new Map<string, string>([
  ["google", "Google"],
  ["github", "GitHub"],
  ["email", "email and password"],
]);

export default async function SettingsPage() {
  const [user, overview] = await Promise.all([getServerUser(), getDashboardOverview()]);
  const provider = user?.provider ? (PROVIDERS.get(user.provider) ?? user.provider) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Your account, how the app looks, and where you're signed in." />

      <div className="flex flex-col gap-6">
        <SettingsSection id="account" title="Account">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={user?.displayName ?? user?.email ?? null} avatarUrl={user?.avatarUrl ?? null} className="size-12 text-base" />
            <div className="min-w-0">
              <p className="truncate text-base font-medium">{user?.displayName ?? "Your account"}</p>
              {user?.email ? <p className="truncate text-sm text-muted-foreground">{user.email}</p> : null}
              {provider ? <p className="text-xs text-muted-foreground">Signed in with {provider}</p> : null}
            </div>
          </div>
        </SettingsSection>

        <SettingsSection id="appearance" title="Appearance" description="Match your device, or always use light or dark.">
          <ThemeSetting />
        </SettingsSection>

        <SettingsSection
          id="install"
          title="Install the app"
          description="Open CopyAnywhere from your home screen or dock, full screen, without the browser bars."
        >
          <InstallAppButton />
        </SettingsSection>

        <SettingsSection
          id="devices"
          title="Devices"
          description="Where your account is signed in, most recent first."
        >
          {!overview.ok ? (
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t load your devices.{" "}
              <Link href="/dashboard/settings" className="font-medium text-primary-ink underline-offset-4 hover:underline">
                Try again
              </Link>
            </p>
          ) : overview.data.devices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No devices yet. Sign in on your phone, the Android app or the browser extension and they show up here.
            </p>
          ) : (
            <DeviceList devices={overview.data.devices} />
          )}
        </SettingsSection>

        <SettingsSection id="sign-out" title="Sign out" description="Your items stay in your account.">
          <SignOutButton />
        </SettingsSection>
      </div>

      <section
        aria-labelledby="danger-zone-title"
        className="flex flex-col gap-4 rounded-lg border border-destructive/40 p-4 sm:p-6"
      >
        <h2 id="danger-zone-title" className="text-base font-semibold text-destructive">
          Danger zone
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex max-w-prose flex-col gap-1">
            <h3 className="text-sm font-medium">Delete your account</h3>
            <p className="text-sm text-muted-foreground">
              This removes everything in it: snippets, files, notes and the rooms you own. It can&apos;t be undone.
              Email us from the address you sign in with and we&apos;ll delete it.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit shrink-0 text-destructive">
            <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Delete my CopyAnywhere account")}`}>
              <Mail aria-hidden="true" />
              Email to delete
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
