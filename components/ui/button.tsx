import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import * as React from "react";

import { cn } from "@/utils/cn";

/**
 * Button — Tier 1 UI primitive.
 *
 * Variants map to semantic tokens. Sizes stay compact for the mouse and grow to
 * a 44px touch target on coarse pointers (phones, tablets). Every variant has a
 * pressed state. `loading` shows a spinner, sets `aria-busy` and disables the
 * button so a form can't be sent twice. `asChild` renders the styling onto its
 * child (e.g. a Next.js <Link>) via Radix Slot.
 */
const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,transform] duration-fast ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        outline:
          "border border-border bg-surface hover:bg-accent hover:text-accent-foreground active:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent active:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent",
        link: "text-primary-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 pointer-coarse:h-11",
        sm: "h-8 px-3 pointer-coarse:h-11 pointer-coarse:px-4",
        lg: "h-11 px-6 text-base",
        icon: "size-9 pointer-coarse:size-11",
        "icon-sm": "size-8 pointer-coarse:size-11",
      },
    },
    compoundVariants: [
      // Inline text links keep their text box, whatever the size.
      { variant: "link", className: "h-auto px-0 pointer-coarse:h-auto pointer-coarse:px-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Pending state: spinner, `aria-busy`, and disabled to block double submits. */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
