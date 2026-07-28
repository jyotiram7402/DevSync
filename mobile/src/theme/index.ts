/**
 * Theme tokens — zinc surfaces + single indigo brand accent, mirroring the web
 * app. Consumed via useTheme(); components never hard-code colors.
 */
export interface Theme {
  dark: boolean;
  colors: {
    background: string;
    card: string;
    border: string;
    text: string;
    mutedText: string;
    brand: string;
    brandText: string;
    danger: string;
    success: string;
    warning: string;
    overlay: string;
  };
  spacing: (n: number) => number;
  radius: { sm: number; md: number; lg: number; pill: number };
}

const base = {
  spacing: (n: number) => n * 4,
  radius: { sm: 6, md: 10, lg: 16, pill: 999 },
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: "#ffffff",
    card: "#ffffff",
    border: "#e4e4e7",
    text: "#09090b",
    mutedText: "#71717a",
    brand: "#4f46e5",
    brandText: "#ffffff",
    danger: "#dc2626",
    success: "#16a34a",
    warning: "#d97706",
    overlay: "rgba(0,0,0,0.4)",
  },
  ...base,
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: "#09090b",
    card: "#111113",
    border: "#27272a",
    text: "#fafafa",
    mutedText: "#a1a1aa",
    brand: "#6366f1",
    brandText: "#09090b",
    danger: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
    overlay: "rgba(0,0,0,0.6)",
  },
  ...base,
};

export function getTheme(scheme: "light" | "dark"): Theme {
  return scheme === "dark" ? darkTheme : lightTheme;
}
