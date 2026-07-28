import { Fragment } from "react";

import { cn } from "@/utils/cn";

/**
 * SearchHighlight — wraps query token matches in <mark>. Tokens are escaped so
 * user input can never form a malicious/invalid RegExp. Purely presentational.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function SearchHighlight({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  const tokens = query
    .trim()
    .split(/\s+/)
    .map((token) => escapeRegExp(token))
    .filter((token) => token.length > 0);

  if (tokens.length === 0) return <span className={className}>{text}</span>;

  const splitter = new RegExp(`(${tokens.join("|")})`, "gi");
  const matcher = new RegExp(`^(?:${tokens.join("|")})$`, "i");
  const parts = text.split(splitter);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        matcher.test(part) ? (
          <mark key={index} className="rounded bg-brand/20 px-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </span>
  );
}
