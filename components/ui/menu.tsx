"use client";

import { Ellipsis, type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

import { ResponsiveDialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/utils/cn";

/**
 * Menu — an overflow/actions menu. On desktop it is a dropdown anchored to its
 * trigger (rendered in a portal, so cards and scroll areas never clip it); on
 * phones the same actions open as a bottom sheet with large rows.
 *
 * Keyboard: Enter/Space open, ArrowDown/ArrowUp open on the first/last item,
 * arrows and Home/End move, Escape or Tab close and return focus to the trigger.
 */
export interface MenuAction {
  label: string;
  icon?: LucideIcon;
  onSelect?: () => void;
  /** Navigate instead of running an action. */
  href?: string;
  destructive?: boolean;
  disabled?: boolean;
}

export type MenuEntry = MenuAction | "separator";

/** Props a custom trigger must spread onto its <button>. */
export interface MenuTriggerProps {
  ref: Ref<HTMLButtonElement>;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string | undefined;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

interface MenuProps {
  /** Names the default trigger and titles the phone sheet, e.g. "Snippet actions". */
  label: string;
  items: ReadonlyArray<MenuEntry>;
  /** Which trigger edge the dropdown lines up with. */
  align?: "start" | "end";
  /** Custom trigger; defaults to a "⋯" icon button. */
  trigger?: (props: MenuTriggerProps) => ReactNode;
  /** Class for the default trigger. */
  className?: string;
}

const DESKTOP_QUERY = "(min-width: 768px)";

export function Menu({ label, items, align = "end", trigger, className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"popover" | "sheet">("popover");
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<"menu" | "first" | "last" | null>(null);
  const menuId = useId();

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    setPosition(null);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  function show(focus: "menu" | "first" | "last") {
    pendingFocus.current = focus;
    setMode(window.matchMedia(DESKTOP_QUERY).matches ? "popover" : "sheet");
    setOpen(true);
  }

  function enabledItems(): HTMLElement[] {
    const menu = menuRef.current;
    if (!menu) return [];
    return Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'));
  }

  // Place the dropdown under the trigger, or above it when there's no room below.
  useLayoutEffect(() => {
    if (!open || mode !== "popover") return;

    function place() {
      const triggerEl = triggerRef.current;
      const menuEl = menuRef.current;
      if (!triggerEl || !menuEl) return;
      const rect = triggerEl.getBoundingClientRect();
      const gap = 4;
      const margin = 8;
      const width = menuEl.offsetWidth;
      const height = menuEl.offsetHeight;
      const fitsBelow = rect.bottom + gap + height <= window.innerHeight - margin;
      const fitsAbove = rect.top - gap - height >= margin;
      const top = fitsBelow || !fitsAbove ? rect.bottom + gap : rect.top - gap - height;
      const preferredLeft = align === "end" ? rect.right - width : rect.left;
      const left = Math.min(Math.max(margin, preferredLeft), window.innerWidth - width - margin);
      setPosition({ top, left });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, mode, align]);

  // Move focus in once the dropdown is placed (it is invisible until then).
  useEffect(() => {
    if (!open || mode !== "popover" || !position || pendingFocus.current === null) return;
    const enabled = enabledItems();
    const target =
      pendingFocus.current === "first"
        ? enabled[0]
        : pendingFocus.current === "last"
          ? enabled[enabled.length - 1]
          : menuRef.current;
    pendingFocus.current = null;
    target?.focus({ preventScroll: true });
  }, [open, mode, position]);

  // A press anywhere outside the dropdown and its trigger closes it.
  useEffect(() => {
    if (!open || mode !== "popover") return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, mode, close]);

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      close(true);
      return;
    }
    const enabled = enabledItems();
    if (enabled.length === 0) return;
    const current = document.activeElement instanceof HTMLElement ? enabled.indexOf(document.activeElement) : -1;
    const last = enabled.length - 1;
    let next: HTMLElement | undefined;
    if (event.key === "ArrowDown") next = enabled[current < 0 || current === last ? 0 : current + 1];
    else if (event.key === "ArrowUp") next = enabled[current <= 0 ? last : current - 1];
    else if (event.key === "Home") next = enabled[0];
    else if (event.key === "End") next = enabled[last];
    else return;
    event.preventDefault();
    next?.focus();
  }

  function select(item: MenuAction) {
    // Popover: hand focus back to the trigger first, so a dialog the action
    // opens returns focus there too. The sheet restores focus on its own.
    close(mode === "popover");
    item.onSelect?.();
  }

  const triggerProps: MenuTriggerProps = {
    ref: triggerRef,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open && mode === "popover" ? menuId : undefined,
    onClick: () => {
      if (open) close(false);
      else show("menu");
    },
    onKeyDown: (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      show(event.key === "ArrowDown" ? "first" : "last");
    },
  };

  function renderItem(item: MenuAction, key: string, variant: "popover" | "sheet") {
    const Icon = item.icon;
    const itemClass = cn(
      "flex w-full items-center text-left transition-colors duration-fast disabled:pointer-events-none disabled:opacity-50",
      variant === "popover"
        ? "gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-accent focus-visible:-outline-offset-2"
        : "min-h-12 gap-3 rounded-md px-3 text-base active:bg-accent",
      item.destructive ? "text-destructive" : "text-foreground",
    );
    const content = (
      <>
        {Icon ? <Icon className={cn("shrink-0", variant === "popover" ? "size-4" : "size-5")} aria-hidden="true" /> : null}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      </>
    );
    const role = variant === "popover" ? "menuitem" : undefined;
    const tabIndex = variant === "popover" ? -1 : undefined;

    if (item.href !== undefined && !item.disabled) {
      return (
        <Link key={key} href={item.href} role={role} tabIndex={tabIndex} className={itemClass} onClick={() => select(item)}>
          {content}
        </Link>
      );
    }
    return (
      <button
        key={key}
        type="button"
        role={role}
        tabIndex={tabIndex}
        disabled={item.disabled}
        className={itemClass}
        onClick={() => select(item)}
      >
        {content}
      </button>
    );
  }

  function renderEntries(variant: "popover" | "sheet") {
    return items.map((entry, index) =>
      entry === "separator" ? (
        <div
          key={`separator-${index}`}
          role={variant === "popover" ? "separator" : undefined}
          className={cn("my-1 h-px bg-border", variant === "popover" ? "-mx-1" : "mx-3")}
        />
      ) : (
        renderItem(entry, `${index}-${entry.label}`, variant)
      ),
    );
  }

  return (
    <>
      {trigger ? (
        trigger(triggerProps)
      ) : (
        <IconButton {...triggerProps} label={label} icon={Ellipsis} className={className} />
      )}

      {open && mode === "popover"
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={label}
              tabIndex={-1}
              onKeyDown={handleMenuKeyDown}
              style={position ? { top: position.top, left: position.left } : { top: 0, left: 0, visibility: "hidden" }}
              // Modal layer, later in the DOM than any open dialog, so a menu opened from a dialog sits above it.
              className="fixed z-modal flex min-w-48 max-w-[calc(100vw-1rem)] flex-col rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-overlay outline-none animate-menu-in"
            >
              {renderEntries("popover")}
            </div>,
            document.body,
          )
        : null}

      {mode === "sheet" ? (
        <ResponsiveDialog open={open} onClose={() => close(false)} title={label}>
          <div className="-mx-2 flex flex-col">{renderEntries("sheet")}</div>
        </ResponsiveDialog>
      ) : null}
    </>
  );
}
