"use client";

import { useEffect, useRef } from "react";

/**
 * Registers the global search shortcut (⌘K / Ctrl+K). The handler is stored in
 * a ref so the listener binds once and never goes stale.
 */
export function useSearchShortcuts(onOpen: () => void): void {
  const handlerRef = useRef(onOpen);
  handlerRef.current = onOpen;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && (event.key === "k" || event.key === "K")) {
        event.preventDefault();
        handlerRef.current();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
