import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

/**
 * The opening of a landing section: its <h2> (pass the id the section's
 * aria-labelledby points at) and a line or two about it. Left-aligned and
 * plain on purpose — the content under it does the talking.
 */
export function SectionHeading({
  id,
  title,
  description,
  className,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-3", className)}>
      <h2 id={id} className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description ? <p className="text-pretty text-base text-muted-foreground sm:text-lg">{description}</p> : null}
    </div>
  );
}
