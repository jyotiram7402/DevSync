import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/utils/cn";

/**
 * DashboardCard — a titled content card for dashboard sections. Optional
 * title/description and an action slot (e.g. a "View all" link). Presentational
 * and reusable across features.
 */
interface DashboardCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  description,
  action,
  children,
  className,
}: DashboardCardProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <Card className={cn(className)}>
      {hasHeader ? (
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex flex-col gap-1">
            {title ? <h3 className="text-sm font-semibold leading-none">{title}</h3> : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </CardHeader>
      ) : null}
      {children ? (
        <CardContent className={cn(hasHeader ? undefined : "pt-6")}>{children}</CardContent>
      ) : null}
    </Card>
  );
}
