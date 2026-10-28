import { Globe, Monitor, Puzzle, Smartphone, SquareTerminal, type LucideIcon } from "lucide-react";

import type { OverviewDevice } from "@/features/dashboard/services/overview-service";
import { formatRelativeTime } from "@/utils/formatters";

const CLIENTS = new Map<string, { label: string; icon: LucideIcon }>([
  ["web", { label: "Web", icon: Globe }],
  ["mobile", { label: "Android app", icon: Smartphone }],
  ["extension", { label: "Browser extension", icon: Puzzle }],
  ["vscode", { label: "VS Code", icon: Monitor }],
  ["cli", { label: "CLI", icon: SquareTerminal }],
]);

/** Where the account is signed in: what it is, the system, and when it was last active. */
export function DeviceList({ devices }: { devices: ReadonlyArray<OverviewDevice> }) {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {devices.map((device) => {
        const client = CLIENTS.get(device.clientType);
        const Icon = client?.icon ?? Monitor;
        return (
          <li key={device.id} className="flex min-h-14 items-center gap-3 px-3 py-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{device.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {[client?.label ?? device.clientType, device.os, device.browser].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
              {device.online ? <span className="size-2 rounded-full bg-success" aria-hidden="true" /> : null}
              {device.online ? "Active now" : device.lastSeenAt ? formatRelativeTime(device.lastSeenAt) : "Not seen yet"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
