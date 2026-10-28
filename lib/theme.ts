/**
 * Theme constants.
 *
 * Centralizes the theme options and the persistence key used by next-themes
 * (wired in providers/index.tsx). Kept free of React/lucide imports so it can
 * be consumed anywhere; the theme toggle maps these values to icons.
 */
export const THEME_STORAGE_KEY = "devsync-theme" as const;

export const DEFAULT_THEME = "system" as const;

export type ThemeValue = "system" | "light" | "dark";

export function isThemeValue(value: string | undefined): value is ThemeValue {
  return value === "system" || value === "light" || value === "dark";
}

/**
 * Browser and installed-app chrome color (`<meta name="theme-color">`) per
 * resolved theme. Must match `--background` in styles/globals.css.
 */
export const THEME_COLOR = {
  light: "#FAFAFB",
  dark: "#0E0F13",
} as const;
