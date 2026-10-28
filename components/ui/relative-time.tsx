"use client";

import { useState } from "react";

import { useMinuteTick } from "@/hooks/use-minute-tick";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/date";
import { formatRelativeTime } from "@/utils/formatters";

/**
 * RelativeTime — "5m ago" that stays fresh, with the exact date and time on
 * hover. With `toggleable`, a tap switches between the two (touch screens have
 * no hover); don't use that inside a link or another button. The exact time is
 * only formatted in the browser, which knows the user's locale and time zone.
 */
interface RelativeTimeProps {
  /** ISO timestamp. */
  value: string;
  toggleable?: boolean;
  className?: string;
}

export function RelativeTime({ value, toggleable = false, className }: RelativeTimeProps) {
  useMinuteTick();
  const mounted = useMounted();
  const [showExact, setShowExact] = useState(false);

  const valid = !Number.isNaN(new Date(value).getTime());
  const relative = valid ? formatRelativeTime(value) : "";
  const exact = mounted && valid ? formatDateTime(value) : undefined;

  const time = (
    <time
      dateTime={value}
      title={exact}
      suppressHydrationWarning
      className={toggleable ? undefined : className}
    >
      {showExact && exact ? exact : relative}
    </time>
  );

  if (!toggleable) return time;

  return (
    <button
      type="button"
      onClick={() => setShowExact((current) => !current)}
      className={cn("rounded-sm underline-offset-2 hover:underline", className)}
    >
      {time}
      <span className="sr-only">{showExact ? " (show how long ago)" : " (show exact time)"}</span>
    </button>
  );
}
