import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import plugin from "tailwindcss/plugin";

/**
 * Tailwind design-system configuration ("Selection").
 *
 * Colors, layers and motion all point at CSS custom properties defined once in
 * styles/globals.css, so a single token set drives both themes. Colors are RGB
 * triplets, which keeps opacity modifiers (`bg-primary/10`) working. Components
 * use these semantic names only — never raw palette classes or hex values.
 */
const color = (token: string) => `rgb(var(--${token}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
  ],
  future: {
    // `hover:` styles only apply on devices that can hover, so a tap never
    // leaves a button stuck in its hover state on phones.
    hoverOnlyWhenSupported: true,
  },
  theme: {
    container: {
      center: true,
      // Page gutters: 16px on phones, 24px on tablets, 32px on desktop.
      padding: {
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Type scale 12/14/16/18/20/24/30/36 — Tailwind's defaults, except 18px
        // gets a 26px line height.
        lg: ["1.125rem", { lineHeight: "1.625rem" }],
      },
      colors: {
        background: color("background"),
        foreground: color("foreground"),
        surface: {
          DEFAULT: color("surface"),
          2: color("surface-2"),
          overlay: color("surface-overlay"),
          hover: color("surface-hover"),
        },
        border: color("border"),
        input: color("input"),
        ring: color("ring"),
        primary: {
          DEFAULT: color("primary"),
          foreground: color("primary-foreground"),
          ink: color("primary-ink"),
        },
        wash: color("wash"),
        destructive: {
          DEFAULT: color("destructive"),
          foreground: color("destructive-foreground"),
        },
        success: {
          DEFAULT: color("success"),
          foreground: color("success-foreground"),
        },
        warning: {
          DEFAULT: color("warning"),
          foreground: color("warning-foreground"),
        },
        favorite: color("favorite"),
        scrim: color("scrim"),
        kind: {
          neutral: color("kind-neutral"),
          code: color("kind-code"),
          command: color("kind-command"),
          error: color("kind-error"),
          link: color("kind-link"),
          image: color("kind-image"),
          doc: color("kind-doc"),
          note: color("kind-note"),
        },
        project: {
          zinc: color("project-zinc"),
          red: color("project-red"),
          orange: color("project-orange"),
          amber: color("project-amber"),
          green: color("project-green"),
          blue: color("project-blue"),
          indigo: color("project-indigo"),
          violet: color("project-violet"),
          pink: color("project-pink"),
        },
        // shadcn-style names used across existing screens, mapped onto the tokens.
        card: {
          DEFAULT: color("surface"),
          foreground: color("foreground"),
        },
        popover: {
          DEFAULT: color("surface-overlay"),
          foreground: color("foreground"),
        },
        secondary: {
          DEFAULT: color("surface-2"),
          foreground: color("foreground"),
        },
        muted: {
          DEFAULT: color("surface-2"),
          foreground: color("muted-foreground"),
        },
        accent: {
          DEFAULT: color("surface-hover"),
          foreground: color("foreground"),
        },
      },
      borderRadius: {
        // Radius follows hierarchy: chips 6 · controls 8 · surfaces 10 · sheets 16.
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "10px",
        "2xl": "16px",
      },
      boxShadow: {
        // The one shadow: menus, sheets, dialogs and toasts. Items and cards use
        // borders and surface tone instead.
        overlay:
          "0 12px 32px -8px rgb(var(--shadow) / 0.18), 0 2px 6px -2px rgb(var(--shadow) / 0.12)",
      },
      zIndex: {
        sticky: "var(--z-sticky)",
        nav: "var(--z-nav)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
      },
      keyframes: {
        "overlay-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "dialog-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          to: { opacity: "1", transform: "none" },
        },
        "sheet-in": {
          from: { transform: "translateY(100%)" },
          to: { transform: "none" },
        },
        "menu-in": {
          from: { opacity: "0", transform: "translateY(-4px) scale(0.98)" },
          to: { opacity: "1", transform: "none" },
        },
        /* An item landing from another device. */
        arrive: {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "none" },
        },
        /* Copy → check icon swap. */
        pop: {
          from: { opacity: "0", transform: "scale(0.6)" },
          to: { opacity: "1", transform: "none" },
        },
        "progress-indeterminate": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(300%)" },
        },
        /* Auth background: a column of six identical item sets moves up by one set per loop
           (COPIES in components/auth/auth-backdrop.tsx). */
        stream: {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% / 6))" },
        },
      },
      animation: {
        "overlay-in": "overlay-in var(--duration-base) var(--ease-out) both",
        "dialog-in": "dialog-in var(--duration-base) var(--ease-out) both",
        "sheet-in": "sheet-in var(--duration-slow) var(--ease-out) both",
        "menu-in": "menu-in var(--duration-fast) var(--ease-out) both",
        arrive: "arrive 220ms var(--ease-out) both",
        pop: "pop var(--duration-fast) var(--ease-out) both",
        "progress-indeterminate": "progress-indeterminate 1.2s ease-in-out infinite",
        stream: "stream var(--stream-duration, 60s) linear var(--stream-delay, 0s) infinite",
      },
    },
  },
  plugins: [
    animate,
    // Input-type variants: size touch targets for fingers, keep the mouse UI compact.
    plugin(({ addVariant }) => {
      addVariant("pointer-coarse", "@media (pointer: coarse)");
      addVariant("pointer-fine", "@media (pointer: fine)");
    }),
  ],
};

export default config;
