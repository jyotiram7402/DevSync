"use client";

import { useRef, type KeyboardEvent } from "react";

/**
 * Keyboard behavior for a radiogroup of buttons (the icon and color pickers):
 * Tab enters at the selected option, arrow keys and Home/End move and select.
 */
export function useRovingRadio<T extends string>(options: readonly T[], value: string, onChange: (value: T) => void) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((option) => option === value);
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

  function select(index: number) {
    const option = options[index];
    if (option === undefined) return;
    onChange(option);
    refs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = options.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    select(next);
  }

  function setRef(index: number) {
    return (node: HTMLButtonElement | null) => {
      refs.current[index] = node;
    };
  }

  return { tabStop, onKeyDown, setRef };
}
