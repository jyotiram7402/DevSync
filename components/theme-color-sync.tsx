"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { THEME_COLOR } from "@/lib/theme";

/**
 * Keeps the browser and installed-app chrome color (meta theme-color) in step
 * with the theme the user picked. The static tags in the root layout can only
 * follow the OS setting. Re-applied on navigation in case the head is re-rendered.
 */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    const color = THEME_COLOR[resolvedTheme];
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      meta.content = color;
    }
  }, [resolvedTheme, pathname]);

  return null;
}
