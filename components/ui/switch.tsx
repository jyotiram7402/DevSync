import * as React from "react";

import { cn } from "@/utils/cn";

/**
 * Switch — an on/off toggle (`role="switch"`), controlled.
 *
 * The track is 40×24px; an invisible 44px-tall hit area surrounds it. Name it
 * with a wrapping `<label>`, `aria-labelledby` or `aria-label`.
 */
export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value" | "role"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className, onClick, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onCheckedChange(!checked);
      }}
      className={cn(
        "group relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full bg-input transition-colors duration-fast before:absolute before:-inset-x-1 before:-inset-y-2.5 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none block size-5 translate-x-0.5 rounded-full bg-surface transition-transform duration-fast ease-out group-data-[state=checked]:translate-x-[1.125rem] dark:bg-foreground"
      />
    </button>
  ),
);
Switch.displayName = "Switch";

export { Switch };
