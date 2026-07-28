import { Check, Copy, Inbox } from "lucide-react";
import { useState } from "react";

import { Spinner } from "@ext/popup/components/ui";
import type { RecentSnippet } from "@ext/types";
import { cn } from "@ext/utils/cn";

function SnippetItem({
  snippet,
  onCopy,
}: {
  snippet: RecentSnippet;
  onCopy: (id: string) => Promise<boolean>;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await onCopy(snippet.id);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <li className="flex items-start gap-2 rounded-md px-2 py-2 hover:bg-muted">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{snippet.title}</span>
          {snippet.language ? (
            <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">
              {snippet.language}
            </span>
          ) : null}
        </div>
        <p className="truncate text-xs text-muted-foreground">{snippet.preview}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy “${snippet.title}” to clipboard`}
        className={cn(
          "shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {copied ? (
          <Check className="size-4 text-emerald-500" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
      </button>
    </li>
  );
}

/** Recent synced snippets with copy actions; loading + empty states. */
export function SnippetList({
  snippets,
  loading,
  onCopy,
}: {
  snippets: RecentSnippet[];
  loading: boolean;
  onCopy: (id: string) => Promise<boolean>;
}) {
  if (loading && snippets.length === 0) return <Spinner label="Loading snippets" />;

  if (snippets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium">No snippets yet</p>
        <p className="text-xs text-muted-foreground">
          Copy something and save it, or create a snippet in DevSync.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5 overflow-y-auto p-1" aria-label="Recent snippets">
      {snippets.map((snippet) => (
        <SnippetItem key={snippet.id} snippet={snippet} onCopy={onCopy} />
      ))}
    </ul>
  );
}
