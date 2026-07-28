"use client";

import { Users } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * PresenceIndicator — presentational count of present members. It takes a plain
 * `count` so it stays business-agnostic; a feature supplies the number from its
 * own presence hook (e.g. useDevicePresence / usePresence).
 */
export function PresenceIndicator({
  count,
  label = "online",
  className,
}: {
  count: number;
  label?: string;
  className?: string;
}) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground",
        className,
      )}
      aria-live="polite"
    >
      <Users className="size-3" aria-hidden="true" />
      <span>
        {count} {label}
      </span>
    </span>
  );
}
