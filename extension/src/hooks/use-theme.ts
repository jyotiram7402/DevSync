import { useEffect } from "react";

import type { Theme } from "@ext/types";

/** Applies the selected theme to the document root (class-based dark mode). */
export function useTheme(theme: Theme): void {
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = theme === "dark" || (theme === "system" && prefersDark);
    root.classList.toggle("dark", dark);
  }, [theme]);
}
