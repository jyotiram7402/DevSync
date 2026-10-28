"use client";

import type { LucideIcon } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";

import { cn } from "@/utils/cn";

/**
 * SegmentedControl — pick one of a few options (theme, kind picker).
 *
 * A radiogroup with a roving tab stop: Tab enters at the selected option and
 * the arrow keys (plus Home/End) move and select. Icon-only options keep their
 * text as the accessible name. Segments are 44px on touch.
 */
export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  /** Show only the icon (the label stays as the accessible name). */
  iconOnly?: boolean;
}

interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  /** `undefined` selects nothing (e.g. before the saved theme is known). */
  value: T | undefined;
  onValueChange: (value: T) => void;
  "aria-label": string;
  size?: "sm" | "default";
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  size = "default",
  className,
  ...rest
}: SegmentedControlProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

  function select(index: number) {
    const option = options[index];
    if (!option) return;
    onValueChange(option.value);
    refs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
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

  return (
    <div
      role="radiogroup"
      aria-label={rest["aria-label"]}
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5",
        className,
      )}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.iconOnly ? option.label : undefined}
            tabIndex={index === tabStop ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent font-medium text-muted-foreground transition-colors duration-fast hover:text-foreground active:bg-accent",
              size === "sm"
                ? "h-7 min-w-7 px-1.5 text-xs pointer-coarse:h-11 pointer-coarse:min-w-11"
                : "h-8 min-w-8 px-2.5 text-sm pointer-coarse:h-11 pointer-coarse:min-w-11",
              checked && "border-border bg-surface text-foreground dark:bg-surface-hover",
            )}
          >
            {Icon ? <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden="true" /> : null}
            {option.iconOnly ? null : option.label}
          </button>
        );
      })}
    </div>
  );
}
