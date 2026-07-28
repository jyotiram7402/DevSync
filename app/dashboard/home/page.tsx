import {
  Clock,
  Code2,
  FolderKanban,
  HardDrive,
  Library,
  MonitorSmartphone,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

import { DashboardCard } from "@/components/shared/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { getServerUser } from "@/lib/auth/session";

export const metadata = {
  title: "Home",
};

// Placeholder data (no backend integration in this sprint).
const STATS = [
  { label: "Snippets", value: "128", icon: Code2, hint: "+12 this week" },
  { label: "Projects", value: "6", icon: FolderKanban, hint: "2 active" },
  { label: "Collections", value: "4", icon: Library, hint: "Across all projects" },
  { label: "Devices", value: "3", icon: MonitorSmartphone, hint: "All in sync" },
] as const;

const RECENT_ACTIVITY = [
  { id: "1", text: "Synced a stack trace from Work Laptop", time: "2 minutes ago" },
  { id: "2", text: "Created project “Acme API”", time: "1 hour ago" },
  { id: "3", text: "Pinned a Docker command", time: "Yesterday" },
] as const;

const DEVICES = [
  { id: "1", name: "Work Laptop", detail: "Chrome on Windows · active now" },
  { id: "2", name: "Personal MacBook", detail: "Safari on macOS · 3h ago" },
  { id: "3", name: "Home Desktop", detail: "Firefox on Linux · yesterday" },
] as const;

const STORAGE_USED_MB = 240;
const STORAGE_LIMIT_MB = 1024;

export default async function DashboardHomePage() {
  const user = await getServerUser();
  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const storagePercent = Math.round((STORAGE_USED_MB / STORAGE_LIMIT_MB) * 100);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is what is happening across your workspace."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/projects">
                <Plus />
                New project
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/snippets">
                <Plus />
                New snippet
              </Link>
            </Button>
          </>
        }
      />

      {/* Workspace overview cards */}
      <section aria-label="Workspace overview" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            hint={stat.hint}
          />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <DashboardCard
          title="Recent activity"
          description="Your latest actions across devices."
          className="lg:col-span-2"
        >
          <ul className="flex flex-col divide-y">
            {RECENT_ACTIVITY.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Clock className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </DashboardCard>

        {/* Sync status */}
        <DashboardCard title="Sync status">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <RefreshCw className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">All changes synced</p>
              <p className="text-xs text-muted-foreground">Last synced just now</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Storage usage */}
        <DashboardCard
          title="Storage"
          description={`${STORAGE_USED_MB} MB of ${STORAGE_LIMIT_MB} MB used`}
          action={<HardDrive className="size-4 text-muted-foreground" aria-hidden="true" />}
        >
          <div
            role="progressbar"
            aria-label="Storage used"
            aria-valuenow={storagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 w-full overflow-hidden rounded-full bg-secondary"
          >
            <div className="h-full rounded-full bg-brand" style={{ width: `${storagePercent}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{storagePercent}% of your free plan.</p>
        </DashboardCard>

        {/* Connected devices */}
        <DashboardCard
          title="Connected devices"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/settings">Manage</Link>
            </Button>
          }
        >
          <ul className="flex flex-col divide-y">
            {DEVICES.map((device) => (
              <li key={device.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <MonitorSmartphone className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{device.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{device.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
}
