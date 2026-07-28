"use client";

import { Pin } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSnippetActions } from "@/features/snippets/hooks/use-snippet-actions";
import { cn } from "@/utils/cn";

/** Optimistic pin toggle (reverts on failure). */
export function PinButton({
  snippetId,
  pinned,
  size = "icon",
}: {
  snippetId: string;
  pinned: boolean;
  size?: "default" | "sm" | "icon";
}) {
  const actions = useSnippetActions();
  const [value, setValue] = useState(pinned);

  async function toggle() {
    const next = !value;
    setValue(next);
    const ok = await actions.setPinned(snippetId, next);
    if (!ok) setValue(!next);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      aria-pressed={value}
      aria-label={value ? "Unpin" : "Pin"}
      onClick={toggle}
    >
      <Pin className={cn("size-4", value && "fill-current")} />
      {size !== "icon" ? (value ? "Pinned" : "Pin") : null}
    </Button>
  );
}
