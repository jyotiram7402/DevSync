"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSnippetActions } from "@/features/snippets/hooks/use-snippet-actions";
import { cn } from "@/utils/cn";

/** Optimistic favorite toggle (reverts on failure). */
export function FavoriteButton({
  snippetId,
  favorite,
  size = "icon",
}: {
  snippetId: string;
  favorite: boolean;
  size?: "default" | "sm" | "icon";
}) {
  const actions = useSnippetActions();
  const [value, setValue] = useState(favorite);

  async function toggle() {
    const next = !value;
    setValue(next);
    const ok = await actions.setFavorite(snippetId, next);
    if (!ok) setValue(!next);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      aria-pressed={value}
      aria-label={value ? "Remove favorite" : "Add favorite"}
      onClick={toggle}
    >
      <Star className={cn("size-4", value && "fill-current text-amber-500")} />
      {size !== "icon" ? (value ? "Favorited" : "Favorite") : null}
    </Button>
  );
}
