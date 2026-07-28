import * as React from "react";

import { cn } from "@/utils/cn";

/**
 * Label — Tier 1 UI primitive. A plain, accessible label (no external
 * dependency). Associate it with an input via `htmlFor`.
 */
const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";

export { Label };
