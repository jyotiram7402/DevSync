import { cn } from "@/utils/cn";

/**
 * Progress — a thin progress bar. Pass `value` (0–100) when progress is known,
 * or `null` for an indeterminate bar. `label` names what is in progress.
 */
interface ProgressProps {
  value: number | null;
  label: string;
  className?: string;
}

export function Progress({ value, label, className }: ProgressProps) {
  const clamped = value === null ? null : Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped === null ? undefined : Math.round(clamped)}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary",
          clamped === null ? "w-1/3 animate-progress-indeterminate" : "transition-[width] duration-base ease-out",
        )}
        style={clamped === null ? undefined : { width: `${clamped}%` }}
      />
    </div>
  );
}
