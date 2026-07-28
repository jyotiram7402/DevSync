"use client";

import { Check } from "lucide-react";

import { PROJECT_COLORS } from "@/features/projects/constants";
import { cn } from "@/utils/cn";

/**
 * Accessible color picker (radiogroup). Controlled via value/onChange.
 */
export function ProjectColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Project color" className="flex flex-wrap gap-2">
      {PROJECT_COLORS.map((color) => {
        const active = value === color.key;
        return (
          <button
            key={color.key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={color.label}
            title={color.label}
            onClick={() => onChange(color.key)}
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-white ring-offset-2 ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              color.swatch,
              active && "ring-2 ring-ring",
            )}
          >
            {active ? <Check className="size-3.5" aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );
}
