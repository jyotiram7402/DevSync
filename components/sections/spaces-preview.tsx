import { SendHorizontal, UserPlus } from "lucide-react";
import type { ReactNode } from "react";

import { Container } from "@/components/shared/container";
import { AvatarStack } from "@/components/ui/avatar";
import { FileIcon } from "@/components/ui/file-icon";
import { KindIcon } from "@/components/ui/kind-badge";

const TABS = [
  { label: "All", count: 6, active: true },
  { label: "Errors", count: 3 },
  { label: "Code", count: 2 },
  { label: "Docs", count: 1 },
];

/** Spaces, shown as a room where a teammate's error has just landed. */
export function SpacesPreview() {
  return (
    <section id="spaces" aria-labelledby="spaces-title" className="scroll-mt-20 border-b border-border bg-surface-2/70">
      <Container className="grid gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
        <div className="flex max-w-xl flex-col gap-5">
          <h2 id="spaces-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Stuck on something together?
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Make a Space for a project and send the link. Paste an error, some code or a file there, and everyone in
            the room sees it the moment it lands.
          </p>
        </div>

        <figure
          role="img"
          aria-label="A Space called checkout-bug with three people in it. An error Priya shared has just arrived and is highlighted."
          className="min-w-0 overflow-hidden rounded-xl border border-border bg-background"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-base font-semibold">checkout-bug</span>
              <span className="text-xs text-muted-foreground">3 people</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <AvatarStack
                size="xs"
                people={[
                  { id: "a", name: "Alex Kim" },
                  { id: "p", name: "Priya Shah" },
                  { id: "m", name: "Marco Rossi" },
                ]}
              />
              <span className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-sm font-medium sm:inline-flex">
                <UserPlus className="size-4" />
                Invite
              </span>
            </div>
          </div>

          <div className="flex gap-2 overflow-hidden border-b border-border px-4 py-2">
            {TABS.map((tab) => (
              <span
                key={tab.label}
                className={
                  tab.active
                    ? "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-wash px-3 text-sm font-medium text-primary-ink"
                    : "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-sm text-muted-foreground"
                }
              >
                {tab.label}
                <span className="text-xs tabular-nums text-muted-foreground">{tab.count}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2 p-3">
            {/* Just arrived: the selection wash the app uses for new items. */}
            <RoomItem
              icon={<KindIcon kind="error" size="sm" />}
              title="TypeError: Cannot read properties of undefined (reading 'total')"
              meta="Priya · just now"
              action="Copy"
              fresh
            />
            <RoomItem
              icon={<KindIcon kind="code" size="sm" />}
              title="fix: guard against an empty cart"
              meta="You · 4 min ago"
              action="Copy"
            />
            <RoomItem
              icon={<FileIcon name="checkout-flow.pdf" size="sm" />}
              title="checkout-flow.pdf"
              meta="Alex · 1 h ago"
              action="Download"
            />
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <span className="flex h-10 min-w-0 flex-1 items-center rounded-md border border-input bg-surface px-3 text-sm text-muted-foreground">
              <span className="truncate">Paste an error, code or a file…</span>
            </span>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <SendHorizontal className="size-4" />
            </span>
          </div>
        </figure>
      </Container>
    </section>
  );
}

function RoomItem({
  icon,
  title,
  meta,
  action,
  fresh = false,
}: {
  icon: ReactNode;
  title: string;
  meta: string;
  action: string;
  fresh?: boolean;
}) {
  return (
    <div
      className={
        fresh
          ? "flex min-w-0 items-center gap-2.5 rounded-lg border border-primary/30 bg-wash px-2.5 py-2"
          : "flex min-w-0 items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2"
      }
    >
      {icon}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <span className="shrink-0 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium">{action}</span>
    </div>
  );
}
