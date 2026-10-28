import * as React from "react";

import { cn } from "@/utils/cn";

/**
 * Textarea — Tier 1 UI primitive. Themed, accessible multiline input that
 * forwards its ref and spreads native attributes. 16px text on phones (no iOS
 * focus zoom), 14px from md up.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-20 w-full min-w-0 rounded-md border border-input bg-surface px-3 py-2 text-base text-foreground transition-colors duration-fast placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:outline-destructive md:text-sm",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
