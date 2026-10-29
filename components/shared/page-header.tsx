import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

/**
 * PageHeader — the title block for in-app pages: the page <h1>, a one-line
 * description of what the page is for, and an actions slot. Actions wrap under
 * the title on phones and sit to the right from sm up; long titles wrap
 * instead of overflowing.
 */
interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight [overflow-wrap:anywhere] md:text-2xl">{title}</h1>
        {description ? <p className="max-w-prose text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
