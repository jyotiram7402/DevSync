import { ClipboardPaste } from "lucide-react";
import Link from "next/link";

import { ArrivalFeed } from "@/components/items/arrival-feed";
import { InstallCard } from "@/components/pwa/install-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LibraryStrip } from "@/features/dashboard/components/library-strip";
import { LiveRefresh } from "@/features/dashboard/components/live-refresh";
import { getDashboardOverview } from "@/features/dashboard/services/overview-service";
import { NotesWidget } from "@/features/notes/components/notes-widget";
import { getNoteBuckets } from "@/features/notes/services/note-service";
import { DeviceList } from "@/features/settings/components/device-list";
import { getSnippetPermissions } from "@/features/snippets";
import { SnippetRow } from "@/features/snippets/components/snippet-row";
import { listSnippets } from "@/features/snippets/services/snippet-service";
import { getServerUser } from "@/lib/auth/session";
import { formatBytes } from "@/utils/formatters";

export const metadata = {
  title: "Home",
};

const LATEST_COUNT = 5;

/**
 * Home — what you saved most recently, ready to copy on this device; the
 * Library at a glance; your notes; and where you're signed in. Live: anything
 * saved on another device slides in here within a second.
 */
export default async function DashboardHomePage() {
  const [user, overviewResult, latestResult, notesResult] = await Promise.all([
    getServerUser(),
    getDashboardOverview(),
    listSnippets({ pageSize: LATEST_COUNT }),
    getNoteBuckets(),
  ]);
  const firstName = user?.displayName?.split(" ")[0];
  const title = firstName ? `Welcome back, ${firstName}` : "Welcome back";

  if (!overviewResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={title} />
        <ErrorState title="Couldn't load your workspace" description={overviewResult.error.message}>
          <Button asChild variant="outline">
            <Link href="/dashboard/home">Try again</Link>
          </Button>
        </ErrorState>
      </div>
    );
  }

  const overview = overviewResult.data;
  const { counts, storageUsedBytes, storageLimitBytes } = overview;
  const storagePercent =
    storageLimitBytes > 0 ? Math.min(100, Math.round((storageUsedBytes / storageLimitBytes) * 100)) : 0;
  const online = overview.devices.filter((device) => device.online).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Live: anything saved on another device shows up here without a reload. */}
      <LiveRefresh workspaceId={overview.workspaceId} />

      <PageHeader title={title} description="Your latest, ready to copy on this device." />

      <InstallCard />

      <section aria-labelledby="home-latest" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="home-latest" className="text-base font-semibold">
            Latest snippets
          </h2>
          <Button asChild variant="ghost" size="sm" className="-mr-2">
            <Link href="/dashboard/snippets">All snippets</Link>
          </Button>
        </div>
        {!latestResult.ok ? (
          <ErrorState title="Couldn't load your snippets" description={latestResult.error.message}>
            <Button asChild variant="outline">
              <Link href="/dashboard/home">Try again</Link>
            </Button>
          </ErrorState>
        ) : latestResult.data.snippets.length === 0 ? (
          <EmptyState
            icon={ClipboardPaste}
            title="Nothing saved yet"
            description="Paste an error, a command or some code with Add (Quick add on a computer). It shows up on your other devices right away."
            action={
              <Button asChild>
                <Link href="/dashboard/snippets/new">New snippet</Link>
              </Button>
            }
          />
        ) : (
          <ArrivalFeed
            label="Latest snippets"
            resetKey="home"
            entries={latestResult.data.snippets.map((snippet) => ({
              id: snippet.id,
              node: (
                <SnippetRow
                  snippet={snippet}
                  permissions={getSnippetPermissions(latestResult.data.role)}
                  selectable={false}
                />
              ),
            }))}
          />
        )}
      </section>

      <section aria-labelledby="home-library" className="flex flex-col gap-3">
        <h2 id="home-library" className="text-base font-semibold">
          Library
        </h2>
        <LibraryStrip counts={counts} />
      </section>

      {notesResult.ok ? <NotesWidget buckets={notesResult.data} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="home-devices" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="home-devices" className="text-base font-semibold">
              Devices{" "}
              <span className="text-sm font-normal text-muted-foreground">
                {online > 0 ? `· ${online} active now` : null}
              </span>
            </h2>
            <Button asChild variant="ghost" size="sm" className="-mr-2">
              <Link href="/dashboard/settings#devices">Manage</Link>
            </Button>
          </div>
          {overview.devices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sign in on your phone or another computer and it shows up here.
            </p>
          ) : (
            <DeviceList devices={overview.devices.slice(0, 3)} />
          )}
        </section>

        <section aria-labelledby="home-storage" className="flex flex-col gap-3">
          <h2 id="home-storage" className="text-base font-semibold">
            Storage
          </h2>
          <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
            <Progress value={storagePercent} label="Storage used" />
            <p className="text-sm text-muted-foreground">
              {formatBytes(storageUsedBytes)} of {formatBytes(storageLimitBytes)} used ({storagePercent}%)
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
