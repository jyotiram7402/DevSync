"use client";

import { Check } from "lucide-react";

import { PROJECT_COLORS } from "@/features/projects/constants";
import { useRovingRadio } from "@/features/projects/hooks/use-roving-radio";
import { cn } from "@/utils/cn";

const COLOR_KEYS = PROJECT_COLORS.map((color) => color.key);

/**
 * Color picker: a radiogroup of swatches (arrow keys move and select). The
 * chosen one shows a check, so the choice never depends on color alone.
 * Swatches are 28px with a 44px hit area on touch.
 */
export function ProjectColorPicker({
  value,
  onChange,
  "aria-labelledby": labelledBy,
}: {
  value: string;
  onChange: (value: string) => void;
  "aria-labelledby"?: string;
}) {
  const { tabStop, onKeyDown, setRef } = useRovingRadio(COLOR_KEYS, value, onChange);

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-1">
      {PROJECT_COLORS.map((color, index) => {
        const active = value === color.key;
        return (
          <button
            key={color.key}
            ref={setRef(index)}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={color.label}
            tabIndex={index === tabStop ? 0 : -1}
            onClick={() => onChange(color.key)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className="flex size-9 items-center justify-center rounded-full pointer-coarse:size-11"
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-background transition-shadow duration-fast",
                color.swatch,
                active && "ring-2 ring-ring ring-offset-2 ring-offset-background",
              )}
            >
              {active ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
