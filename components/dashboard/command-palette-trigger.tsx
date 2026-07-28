"use client";

import { Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

/**
 * Compact command-palette launcher (UI only) for narrow viewports where the
 * full SearchBar is hidden. Placeholder behavior until the palette ships.
 */
export function CommandPaletteTrigger({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Open command palette"
      onClick={() => toast("Command palette is coming soon.")}
      className={cn(className)}
    >
      <Search className="size-5" />
    </Button>
  );
}
