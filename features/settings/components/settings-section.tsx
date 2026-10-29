import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

/**
 * One Settings group: its name and a line about it, then the controls.
 * Stacked on phones; from md the name sits in a left column.
 */
export function SettingsSection({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn(
        "grid scroll-mt-20 gap-4 border-t border-border pt-6 first:border-t-0 first:pt-0 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8",
        className,
      )}
      id={id}
    >
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-title`} className="text-base font-semibold">
          {title}
        </h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex min-w-0 flex-col gap-3">{children}</div>
    </section>
  );
}
