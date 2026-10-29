"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { SegmentedControl, type SegmentedOption } from "@/components/ui/segmented-control";
import { useMounted } from "@/hooks/use-mounted";
import { isThemeValue, type ThemeValue } from "@/lib/theme";

/**
 * Accessible System / Light / Dark theme control (arrow keys move and select).
 *
 * The active option is only highlighted after mount (the saved theme is
 * client-only) so the server and first client render agree and there is no
 * hydration mismatch. Persistence is handled by next-themes (see
 * providers/index.tsx).
 */
const OPTIONS: ReadonlyArray<SegmentedOption<ThemeValue>> = [
  { value: "system", label: "System", icon: Monitor, iconOnly: true },
  { value: "light", label: "Light", icon: Sun, iconOnly: true },
  { value: "dark", label: "Dark", icon: Moon, iconOnly: true },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <SegmentedControl
      aria-label="Color theme"
      options={OPTIONS}
      value={mounted && isThemeValue(theme) ? theme : undefined}
      onValueChange={setTheme}
      size="sm"
      className={className}
    />
  );
}
