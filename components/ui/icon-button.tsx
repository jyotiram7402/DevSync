import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * IconButton — an icon-only button with a required accessible name.
 *
 * `label` becomes the `aria-label` (there is no visible text). Compact for the
 * mouse (36px, or 32px at `size="sm"`), a 44px touch target on coarse pointers.
 * While `loading`, the spinner replaces the icon.
 */
export interface IconButtonProps
  extends Omit<ButtonProps, "asChild" | "children" | "size" | "aria-label"> {
  label: string;
  icon: LucideIcon;
  size?: "default" | "sm";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { label, icon: Icon, size = "default", variant = "ghost", type = "button", loading = false, ...props },
    ref,
  ) => (
    <Button
      ref={ref}
      type={type}
      variant={variant}
      size={size === "sm" ? "icon-sm" : "icon"}
      aria-label={label}
      loading={loading}
      {...props}
    >
      {loading ? null : <Icon aria-hidden="true" />}
    </Button>
  ),
);
IconButton.displayName = "IconButton";
