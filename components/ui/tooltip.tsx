"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/utils/cn";

/**
 * Tooltip — a short visual hint for mouse and keyboard users (never on touch).
 *
 * It repeats the trigger's accessible name, so it is hidden from screen
 * readers. Shows after a short hover delay or on keyboard focus; Escape,
 * pointer leave and blur dismiss it.
 */
interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

function hasFocusVisible(element: Element): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    return false;
  }
}

export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function hide() {
    window.clearTimeout(timer.current);
    setOpen(false);
  }

  return (
    <span
      className={cn("relative inline-flex", className)}
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setOpen(true), 400);
      }}
      onPointerLeave={hide}
      onFocus={(event) => {
        if (hasFocusVisible(event.target)) setOpen(true);
      }}
      onBlur={hide}
    >
      {children}
      {open ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-1/2 z-overlay -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-overlay animate-overlay-in",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
