"use client";

import { useRovingRadio } from "@/features/projects/hooks/use-roving-radio";
import { getProjectIcon, PROJECT_ICON_KEYS, PROJECT_ICON_LABELS } from "@/features/projects/icons";
import { cn } from "@/utils/cn";

/**
 * Icon picker: a radiogroup of icon buttons (arrow keys move and select).
 * Controlled via value/onChange so it can be wired into React Hook Form.
 */
export function ProjectIconPicker({
  value,
  onChange,
  "aria-labelledby": labelledBy,
}: {
  value: string;
  onChange: (value: string) => void;
  "aria-labelledby"?: string;
}) {
  const { tabStop, onKeyDown, setRef } = useRovingRadio(PROJECT_ICON_KEYS, value, onChange);

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {PROJECT_ICON_KEYS.map((key, index) => {
        const Icon = getProjectIcon(key);
        const active = value === key;
        return (
          <button
            key={key}
            ref={setRef(index)}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={PROJECT_ICON_LABELS[key]}
            tabIndex={index === tabStop ? 0 : -1}
            onClick={() => onChange(key)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "flex size-9 items-center justify-center rounded-md border transition-colors duration-fast active:bg-accent pointer-coarse:size-11",
              active
                ? "border-primary bg-wash text-primary-ink"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
