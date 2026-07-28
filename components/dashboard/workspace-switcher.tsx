"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

/**
 * Workspace switcher (UI only — placeholder data, no persistence). Demonstrates
 * the multi-workspace model the schema supports. Accessible disclosure:
 * aria-haspopup/expanded, Escape and outside-click to close.
 */
interface MockWorkspace {
  id: string;
  name: string;
  plan: "free" | "pro";
}

const MOCK_WORKSPACES: readonly MockWorkspace[] = [
  { id: "personal", name: "Personal Workspace", plan: "free" },
  { id: "acme", name: "Acme Inc.", plan: "pro" },
];

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(MOCK_WORKSPACES[0]?.id ?? "personal");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const active = MOCK_WORKSPACES.find((workspace) => workspace.id === activeId) ?? MOCK_WORKSPACES[0];
  if (!active) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-5 items-center justify-center rounded bg-brand text-[10px] font-bold text-brand-foreground">
          {active.name.charAt(0)}
        </span>
        <span className="max-w-[8rem] truncate font-medium sm:max-w-[12rem]">{active.name}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Switch workspace"
          className="absolute left-0 z-50 mt-2 w-64 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {MOCK_WORKSPACES.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              role="menuitemradio"
              aria-checked={workspace.id === activeId}
              onClick={() => {
                setActiveId(workspace.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-5 items-center justify-center rounded bg-secondary text-[10px] font-bold">
                {workspace.name.charAt(0)}
              </span>
              <span className="flex-1 truncate text-left">{workspace.name}</span>
              <Badge variant={workspace.plan === "pro" ? "brand" : "muted"} className="uppercase">
                {workspace.plan}
              </Badge>
              {workspace.id === activeId ? <Check className="size-4" aria-hidden="true" /> : null}
            </button>
          ))}
          <div className="my-1 h-px bg-border" role="separator" />
          <button
            type="button"
            disabled
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground opacity-60"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create workspace
          </button>
        </div>
      ) : null}
    </div>
  );
}
