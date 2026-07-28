"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

export interface SearchNavigationOptions {
  onSelect: (index: number) => void;
  onClose?: () => void;
}

export interface SearchNavigationApi {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

/**
 * Arrow-key navigation over a flat result list: Up/Down move the active row,
 * Enter selects it, Escape closes. The active index resets when the list size
 * changes. Handlers are held in a ref so the returned callback stays stable.
 */
export function useSearchNavigation(
  count: number,
  options: SearchNavigationOptions,
): SearchNavigationApi {
  const [activeIndex, setActiveIndex] = useState(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    setActiveIndex((current) => (current >= count ? 0 : current));
  }, [count]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (count === 0 ? 0 : Math.min(count - 1, index + 1)));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
      } else if (event.key === "Enter") {
        if (count > 0) {
          event.preventDefault();
          optionsRef.current.onSelect(activeIndex);
        }
      } else if (event.key === "Escape") {
        optionsRef.current.onClose?.();
      }
    },
    [count, activeIndex],
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
}
