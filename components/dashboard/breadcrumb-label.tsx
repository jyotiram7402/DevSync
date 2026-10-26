"use client";

import { useEffect } from "react";

import { useUIStore } from "@/stores/ui-store";

/**
 * Lets a detail page name its final breadcrumb (e.g. the room's name instead of
 * its id). Renders nothing; clears the label when the page unmounts.
 */
export function BreadcrumbLabel({ label }: { label: string }) {
  const setBreadcrumbLabel = useUIStore((state) => state.setBreadcrumbLabel);

  useEffect(() => {
    setBreadcrumbLabel(label);
    return () => setBreadcrumbLabel(null);
  }, [label, setBreadcrumbLabel]);

  return null;
}
