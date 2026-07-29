"use client";

import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useQuickCapture } from "@/features/capture/quick-capture-provider";

/** Top-bar trigger that opens the Universal Quick Capture modal. */
export function QuickCaptureButton() {
  const { open } = useQuickCapture();
  return (
    <Button
      type="button"
      size="sm"
      onClick={open}
      className="gap-1.5"
      aria-label="Quick capture — paste or upload to sync"
    >
      <Zap className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">Quick add</span>
    </Button>
  );
}
