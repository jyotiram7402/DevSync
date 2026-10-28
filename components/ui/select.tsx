import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/utils/cn";

/**
 * Select — a styled native <select>.
 *
 * Native pickers are the most usable choice on phones (system wheel or sheet)
 * and need no JavaScript. `className` sizes the wrapper; the control fills it.
 * 16px text on phones, 14px from md up; 44px tall on touch.
 */
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <span className={cn("relative inline-flex w-full min-w-0", className)}>
    <select
      ref={ref}
      className="h-10 w-full min-w-0 cursor-pointer appearance-none truncate rounded-md border border-input bg-surface py-2 pl-3 pr-9 text-base text-foreground transition-colors duration-fast focus-visible:border-ring focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive md:text-sm pointer-coarse:h-11"
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
    />
  </span>
));
Select.displayName = "Select";

export { Select };
