"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toaster — the app-wide toast surface (Sonner), styled to the CopyAnywhere theme.
 *
 * It reads the active theme from next-themes so toasts match light/dark mode,
 * and maps Sonner's slots to our design tokens. Toasts sit bottom-right on
 * larger screens and full-width at the bottom on phones, lifted above the
 * phone tab bar and the home indicator (`--toast-offset-bottom` in
 * styles/globals.css). Mounted once in <Providers>.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      offset={{ bottom: "var(--toast-offset-bottom)", right: "1.5rem" }}
      mobileOffset={{ bottom: "var(--toast-offset-bottom)", left: "1rem", right: "1rem" }}
      gap={8}
      style={{ zIndex: "var(--z-toast)" }}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-lg group-[.toaster]:border-border group-[.toaster]:bg-popover group-[.toaster]:font-sans group-[.toaster]:text-popover-foreground group-[.toaster]:shadow-overlay",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:[&_[data-icon]]:text-success",
          error: "group-[.toaster]:[&_[data-icon]]:text-destructive",
          warning: "group-[.toaster]:[&_[data-icon]]:text-warning",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
