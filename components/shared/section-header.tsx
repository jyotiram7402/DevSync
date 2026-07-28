import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

/**
 * SectionHeader — the standard eyebrow + title + description block that opens a
 * marketing section. Uses an <h2> (the page's <h1> is the hero). Centered by
 * default; pass align="left" for left-aligned sections.
 */
interface SectionHeaderProps {
  title: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeader({
  title,
  eyebrow,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Badge variant="brand">{eyebrow}</Badge> : null}
      <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description ? (
        <p className={cn("text-muted-foreground", centered ? "max-w-2xl" : "max-w-2xl")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
