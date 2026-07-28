import { cn } from "@/utils/cn";

/**
 * KeyboardShortcutHint — renders a row of <kbd> keys (e.g. ⌘ K, ↑ ↓, ↵).
 * Decorative; the actual shortcuts are wired by the hosting component.
 */
export function KeyboardShortcutHint({
  keys,
  label,
  className,
}: {
  keys: string[];
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
      {label ? <span>{label}</span> : null}
      {keys.map((key, index) => (
        <kbd
          key={`${key}-${index}`}
          className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
