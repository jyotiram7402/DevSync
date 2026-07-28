import { Loader2 } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * LoadingSpinner — a consistent, accessible spinner. Exposes a status role and
 * an accessible label so screen readers announce the loading state.
 */
const SIZE_CLASSES = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
} as const;

interface LoadingSpinnerProps {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = "md", className, label = "Loading" }: LoadingSpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn("animate-spin text-muted-foreground", SIZE_CLASSES[size], className)}
    />
  );
}
