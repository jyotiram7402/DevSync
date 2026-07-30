import {
  Code2,
  FileText,
  FolderKanban,
  HardDrive,
  Image as ImageIcon,
  Library,
  Link2,
  MonitorSmartphone,
  Plus,
  RefreshCw,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { DashboardCard } from "@/components/shared/dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { LiveRefresh } from "@/features/dashboard/components/live-refresh";
import { RecentSyncList } from "@/features/dashboard/components/recent-sync-list";
import { getDashboardOverview } from "@/features/dashboard/services/overview-service";
import { getServerUser } from "@/lib/auth/session";
import { formatBytes, formatRelativeTime } from "@/utils/formatters";

export const metadata = {
  title: "Home",
};

const CLIENT_LABEL: Record<string, string> = {
  web: "Web",
  mobile: "Android app",
  extension: "Browser extension",
  vscode: "VS Code",
  cli: "CLI",
};

export default async function DashboardHomePage() {
  const user = await getServerUser();
  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const result = await getDashboardOverview();

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={`Welcome back, ${firstName}`} />
        <EmptyState title="Unable to load your workspace" description={result.error.message} />
      </div>
    );
  }

  const overview = result.data;
  const { counts, storageUsedBytes, storageLimitBytes } = overview;
  const storagePercent =
    storageLimitBytes > 0
      ? Math.min(100, Math.round((storageUsedBytes / storageLimitBytes) * 100))
      : 0;
  const onlineCount = overview.devices.filter((device) => device.online).length;

  const contentStats = [
    { label: "Snippets", value: counts.snippets, icon: Code2, hint: "Text & code" },
    { label: "Images", value: counts.images, icon: ImageIcon, hint: "Synced images" },
    { label: "Links", value: counts.links, icon: Link2, hint: "Saved URLs" },
    {
      label: "Docs & files",
      value: counts.docs + counts.files,
      icon: FileText,
      hint: "Attachments",
    },
  ];

  const workspaceStats = [
    { label: "Projects", value: counts.projects, icon: FolderKanban, hint: "Active" },
    { label: "Collections", value: counts.collections, icon: Library, hint: "In this workspace" },
    {
      label: "Devices",
      value: counts.devices,
      icon: MonitorSmartphone,
      hint: `${onlineCount} online`,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Live: refreshes this server-rendered page whenever anything syncs. */}
      <LiveRefresh workspaceId={overview.workspaceId} />

      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Here is what is happening across ${overview.workspaceName}.`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/projects/new">
                <Plus />
                New project
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/snippets/new">
                <Plus />
                New snippet
              </Link>
            </Button>
          </>
        }
      />

      <section aria-label="Content overview" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contentStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={String(stat.value)}
            icon={stat.icon}
            hint={stat.hint}
          />
        ))}
      </section>

      <section aria-label="Workspace overview" className="grid gap-4 sm:grid-cols-3">
        {workspaceStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={String(stat.value)}
            icon={stat.icon}
            hint={stat.hint}
          />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardCard
          title="Recent sync"
          description="Your latest synced items, newest first."
          className="lg:col-span-2"
          action={<Zap className="size-4 text-muted-foreground" aria-hidden="true" />}
        >
          <RecentSyncList items={overview.recent} />
        </DashboardCard>

        <DashboardCard title="Sync status">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <RefreshCw className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">
                {overview.lastSyncedAt ? "All changes synced" : "Nothing synced yet"}
              </p>
              <p className="text-xs text-muted-foreground">
                {overview.lastSyncedAt
                  ? `Last synced ${formatRelativeTime(overview.lastSyncedAt)}`
                  : "Sync your first item to get started."}
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Storage"
          description={`${formatBytes(storageUsedBytes)} of ${formatBytes(storageLimitBytes)} used`}
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

        <DashboardCard
          title="Connected devices"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/settings">Manage</Link>
            </Button>
          }
        >
          {overview.devices.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No devices registered yet. Sign in on the Android app or the browser extension to see
              them here.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {overview.devices.map((device) => (
                <li key={device.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <MonitorSmartphone className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{device.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[
                        CLIENT_LABEL[device.clientType] ?? device.clientType,
                        device.os,
                        device.online ? "active now" : formatRelativeTime(device.lastSeenAt),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {device.online ? (
                    <span
                      className="size-2 shrink-0 rounded-full bg-emerald-500"
                      aria-label="Online"
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
