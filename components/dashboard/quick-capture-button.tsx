"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useQuickCapture } from "@/features/capture/quick-capture-provider";
import { cn } from "@/utils/cn";

/**
 * Top-bar "Quick add" (tablet and desktop; phones use the ＋ in the bottom
 * bar). Icon-only on tablets, labeled from lg up.
 */
export function QuickCaptureButton({ className }: { className?: string }) {
  const { open } = useQuickCapture();

  return (
    <Button type="button" size="sm" onClick={open} aria-label="Quick add" className={cn("gap-1.5", className)}>
      <Plus aria-hidden="true" />
      <span className="hidden lg:inline">Quick add</span>
    </Button>
  );
}
