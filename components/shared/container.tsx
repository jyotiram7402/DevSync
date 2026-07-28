import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

/**
 * Container — centers content and constrains it to a comfortable reading width
 * with responsive horizontal padding. The single source of horizontal rhythm;
 * wrap it in a semantic element (e.g. <section>) at the call site.
 */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6 lg:px-8", className)}>{children}</div>;
}
