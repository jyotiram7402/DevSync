import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/utils/cn";

/**
 * Checkbox — a native checkbox with a themed 20px box.
 *
 * The real input sits invisibly on top with a larger hit area: 24px for the
 * mouse, 44px on touch. Works with `<label>`, forms and react-hook-form
 * (forwards its ref). Label it with a wrapping `<label>` or `aria-label`.
 */
export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => (
  <span className={cn("relative inline-flex size-5 shrink-0", className)}>
    <input
      ref={ref}
      type="checkbox"
      className="peer absolute -inset-0.5 z-10 m-0 cursor-pointer appearance-none rounded-sm opacity-0 disabled:cursor-not-allowed pointer-coarse:-inset-3"
      {...props}
    />
    <span
      aria-hidden="true"
      className="pointer-events-none size-5 rounded-sm border border-input bg-surface transition-colors duration-fast peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-disabled:opacity-50 peer-aria-[invalid=true]:border-destructive"
    />
    <Check
      aria-hidden="true"
      strokeWidth={3}
      className="pointer-events-none absolute inset-0 m-auto size-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
    />
  </span>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
