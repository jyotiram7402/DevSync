import * as React from "react";

import { cn } from "@/utils/cn";

/**
 * Input — Tier 1 UI primitive. Themed, accessible text input that forwards its
 * ref and spreads native attributes (pass the right `type`, `inputMode`,
 * `autoComplete` and `enterKeyHint`).
 *
 * 16px text on phones (no iOS focus zoom), 14px from md up; 44px tall on touch.
 * `min-w-0` lets it shrink inside flex rows on narrow screens.
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full min-w-0 rounded-md border border-input bg-surface px-3 py-2 text-base text-foreground transition-colors duration-fast placeholder:text-muted-foreground file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-ring focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:outline-destructive md:text-sm pointer-coarse:h-11",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
