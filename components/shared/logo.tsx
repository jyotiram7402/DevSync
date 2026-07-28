import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/utils/cn";

/**
 * Logo — the DevSync mark (a brand-colored double-chevron, echoing the sync
 * motion) with an optional wordmark. Links home by default. The mark is
 * decorative; the link carries an accessible name.
 */
interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  href?: string;
}

function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg bg-brand text-brand-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 9 L17 16 L10 23" />
        <path d="M18 9 L25 16 L18 23" opacity={0.55} />
      </svg>
    </span>
  );
}

export function Logo({ className, showWordmark = true, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={APP_NAME}
      className={cn(
        "inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <LogoMark />
      {showWordmark ? (
        <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
      ) : null}
    </Link>
  );
}
