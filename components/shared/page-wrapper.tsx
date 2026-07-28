import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

/**
 * PageWrapper — the top-level page shell: a full-height flex column so headers
 * pin to the top and footers sink to the bottom regardless of content length.
 */
export function PageWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex min-h-screen flex-col", className)}>{children}</div>;
}
