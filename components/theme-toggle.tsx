"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/use-mounted";
import type { ThemeValue } from "@/lib/theme";
import { cn } from "@/utils/cn";

/**
 * Accessible System / Light / Dark theme control.
 *
 * A compact segmented radiogroup. The active option is only highlighted after
 * mount (the resolved theme is client-only) so the server and first client
 * render agree and there is no hydration mismatch. Persistence is handled by
 * next-themes (see providers/index.tsx).
 */
const OPTIONS: ReadonlyArray<{
  value: ThemeValue;
  label: string;
  Icon: typeof Monitor;
}> = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex items-center gap-0.5 rounded-full border bg-background/60 p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              active && "bg-secondary text-foreground shadow-sm",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
