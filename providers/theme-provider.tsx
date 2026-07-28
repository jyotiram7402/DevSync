"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Thin wrapper around next-themes' provider.
 *
 * Isolating it here keeps the "use client" boundary and the next-themes import
 * in one place, and lets us swap or extend theming behavior without touching
 * every consumer. Configuration (attribute, default theme) is supplied by
 * <Providers>.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
