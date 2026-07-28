import type { Config } from "tailwindcss";

/**
 * Tailwind for the extension surfaces (popup + options). Mirrors the app's
 * zinc + single-brand-accent language via CSS variables defined in
 * src/styles/index.css, and supports class-based dark mode.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,html}", "./index.html"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
    },
  },
  plugins: [],
};

export default config;
