"use client";

import { getProjectIcon, PROJECT_ICON_KEYS } from "@/features/projects/icons";
import { cn } from "@/utils/cn";

/**
 * Accessible icon picker (radiogroup). Controlled via value/onChange so it can
 * be wired into React Hook Form.
 */
export function ProjectIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Project icon" className="flex flex-wrap gap-2">
      {PROJECT_ICON_KEYS.map((key) => {
        const Icon = getProjectIcon(key);
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={key}
            onClick={() => onChange(key)}
            className={cn(
              "flex size-9 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-brand bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
