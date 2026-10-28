import Link from "next/link";
import type { ReactNode } from "react";

import { KindIcon } from "@/components/ui/kind-badge";
import type { ItemKind } from "@/lib/item-kinds";
import { cn } from "@/utils/cn";

/**
 * ItemRow — the list form of any saved item (snippet, Library file, Space
 * item, search hit), so items look and behave the same everywhere:
 *
 *   [leading] [kind]  Title · badges ................ [menu]
 *   preview (text, code, link, file details)
 *   meta (time, language, source, author) ........ [primary]
 *
 * The whole row opens the item (`href`, a stretched link); the checkbox, the
 * primary action (Copy for text, Open/Download for files) and the menu sit
 * above that link and are always visible — never behind hover.
 */
interface ItemRowProps {
  kind: ItemKind;
  title: string;
  href?: string;
  /** Replaces the kind tile, e.g. an image thumbnail. */
  media?: ReactNode;
  /** Before the kind tile, e.g. a selection checkbox. */
  leading?: ReactNode;
  /** After the title: pinned, favorite, archived… */
  badges?: ReactNode;
  preview?: ReactNode;
  meta?: ReactNode;
  primaryAction?: ReactNode;
  menu?: ReactNode;
  className?: string;
}

export function ItemRow({
  kind,
  title,
  href,
  media,
  leading,
  badges,
  preview,
  meta,
  primaryAction,
  menu,
  className,
}: ItemRowProps) {
  return (
    <article
      className={cn(
        "relative flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-colors duration-fast sm:p-4",
        href && "hover:border-input/60",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {leading ? <div className="relative z-10 flex h-8 shrink-0 items-center">{leading}</div> : null}
        {media ?? <KindIcon kind={kind} size="sm" />}
        <div className="flex min-h-8 min-w-0 flex-1 items-center gap-2">
          <h3 className="min-w-0 truncate text-sm font-medium text-foreground">
            {href ? (
              <Link
                href={href}
                className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          {badges ? <span className="flex shrink-0 items-center gap-1">{badges}</span> : null}
        </div>
        {menu ? <div className="relative z-10 -my-1 -mr-1 shrink-0">{menu}</div> : null}
      </div>

      {preview ? <div className="min-w-0">{preview}</div> : null}

      {meta || primaryAction ? (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {meta}
          </div>
          {primaryAction ? <div className="relative z-10 shrink-0">{primaryAction}</div> : null}
        </div>
      ) : null}
    </article>
  );
}

/** The dot between meta parts ("2m ago · TypeScript"), hidden from screen readers. */
export function MetaDot() {
  return <span aria-hidden="true">·</span>;
}
