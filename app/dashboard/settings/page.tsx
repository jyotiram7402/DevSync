import { DashboardCard } from "@/components/shared/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Settings",
};

const SETTINGS_SECTIONS = [
  { title: "Profile", description: "Your name, avatar, and connected sign-in providers." },
  { title: "Preferences", description: "Theme, default project, and keyboard shortcuts." },
  { title: "Devices", description: "Review and revoke devices connected to your account." },
  { title: "Data & privacy", description: "Export your data or delete your account." },
] as const;

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your account and workspace preferences." />
      <div className="grid gap-4 sm:grid-cols-2">
        {SETTINGS_SECTIONS.map((section) => (
          <DashboardCard key={section.title} title={section.title} description={section.description}>
            <p className="text-sm text-muted-foreground">Configuration options arrive soon.</p>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
