"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { SegmentedControl, type SegmentedOption } from "@/components/ui/segmented-control";
import { useMounted } from "@/hooks/use-mounted";
import { isThemeValue, type ThemeValue } from "@/lib/theme";

const OPTIONS: ReadonlyArray<SegmentedOption<ThemeValue>> = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

/** System / Light / Dark with visible labels (the top bar has the compact icon version). */
export function ThemeSetting() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <SegmentedControl
      aria-label="Color theme"
      options={OPTIONS}
      value={mounted && isThemeValue(theme) ? theme : undefined}
      onValueChange={setTheme}
      className="w-fit"
    />
  );
}
