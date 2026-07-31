import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Tailwind design-system configuration.
 *
 * Colors are mapped to CSS custom properties defined in styles/globals.css so
 * that a single token set drives both light and dark themes. Radius, fonts,
 * and animations are likewise tokenized. This is the single source of truth
 * for the DevSync design system referenced throughout the app.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          accent: "hsl(var(--accent-brand))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 1px 3px 0 hsl(240 10% 4% / 0.06), 0 1px 2px -1px hsl(240 10% 4% / 0.06)",
        premium:
          "0 4px 24px -6px hsl(240 10% 4% / 0.12), 0 2px 6px -2px hsl(240 10% 4% / 0.08)",
        glow: "0 0 48px -12px hsl(var(--brand) / 0.45)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        /* Packet travelling along the sync path in the hero visual. */
        "travel-right": {
          "0%": { opacity: "0", transform: "translateX(0) scale(0.8)" },
          "12%": { opacity: "1", transform: "translateX(6%) scale(1)" },
          "88%": { opacity: "1", transform: "translateX(94%) scale(1)" },
          "100%": { opacity: "0", transform: "translateX(100%) scale(0.8)" },
        },
        /* Soft breathing halo on connected devices. */
        "pulse-ring": {
          "0%": { opacity: "0.55", transform: "scale(0.92)" },
          "70%": { opacity: "0", transform: "scale(1.35)" },
          "100%": { opacity: "0", transform: "scale(1.35)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "word-in": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-up": "fade-up 0.5s ease-out both",
        "scale-in": "scale-in 0.4s ease-out both",
        "travel-right": "travel-right 2.4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        float: "float 4s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        "word-in": "word-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [animate],
};

export default config;
