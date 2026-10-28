"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/utils/cn";

/**
 * ResponsiveDialog — the one modal primitive: a centered dialog from md up and
 * a bottom sheet on phones (drag handle, up to 90% of the screen, scrolls
 * inside, respects the home indicator). The switch is pure CSS, so there is no
 * layout flash.
 *
 * While open, everything outside it is `inert` (focus and screen readers stay
 * inside), page scroll is locked, Escape / the close button / a tap on the
 * backdrop close it, and focus returns to whatever opened it. Put
 * `data-autofocus` on the element that should receive focus first; otherwise an
 * `autoFocus` field keeps focus, or the panel itself is focused.
 */

/** Open modals, innermost last: only the top one reacts to Escape. */
const openModals: HTMLElement[] = [];

function useModalBehavior(
  active: boolean,
  rootRef: RefObject<HTMLDivElement | null>,
  panelRef: RefObject<HTMLDivElement | null>,
  onClose: () => void,
) {
  // Callers often pass an inline onClose; keep the latest without re-running the effect.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!active || !root || !panel) return;

    const restoreTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Everything else becomes inert; live regions stay so announcements still reach screen readers.
    const madeInert: HTMLElement[] = [];
    for (const element of Array.from(document.body.children)) {
      if (!(element instanceof HTMLElement) || element === root) continue;
      if (element.hasAttribute("inert") || element.hasAttribute("aria-live")) continue;
      element.setAttribute("inert", "");
      madeInert.push(element);
    }

    // Lock page scroll without shifting the layout where the scrollbar was.
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    openModals.push(root);

    if (!panel.contains(document.activeElement)) {
      const preferred = panel.querySelector<HTMLElement>("[data-autofocus]");
      (preferred ?? panel).focus({ preventScroll: true });
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (openModals[openModals.length - 1] !== root) return;
      event.preventDefault();
      onCloseRef.current();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const index = openModals.lastIndexOf(root);
      if (index !== -1) openModals.splice(index, 1);
      for (const element of madeInert) element.removeAttribute("inert");
      html.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      if (restoreTarget?.isConnected) restoreTarget.focus({ preventScroll: true });
    };
  }, [active, rootRef, panelRef]);
}

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
} as const;

export interface ResponsiveDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | undefined;
  children?: ReactNode;
  /** Actions pinned under the scrolling body, so they stay visible on long sheets. */
  footer?: ReactNode;
  size?: keyof typeof SIZES;
  className?: string;
}

export function ResponsiveDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: ResponsiveDialogProps) {
  const mounted = useMounted();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const active = open && mounted;

  useModalBehavior(active, rootRef, panelRef, onClose);

  if (!active) return null;

  const hasBody = children !== undefined && children !== null && children !== false;

  return createPortal(
    <div ref={rootRef} className="fixed inset-0 z-modal flex items-end justify-center md:items-center md:p-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 animate-overlay-in bg-scrim/40 dark:bg-scrim/60"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-popover text-popover-foreground shadow-overlay outline-none animate-sheet-in md:max-h-[calc(100dvh-3rem)] md:rounded-2xl md:animate-dialog-in",
          SIZES[size],
          className,
        )}
      >
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border md:hidden" />
        <div
          className={cn(
            "flex shrink-0 items-start justify-between gap-3 px-5 pt-3 md:px-6 md:pt-5",
            hasBody || footer ? "pb-3" : "pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-6",
          )}
        >
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id={titleId} className="text-lg font-semibold [overflow-wrap:anywhere]">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton label="Close" icon={X} size="sm" onClick={onClose} className="-mr-2 -mt-1 shrink-0" />
        </div>

        {hasBody ? (
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 md:px-6",
              footer ? "pb-4" : "pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-6",
            )}
          >
            {children}
          </div>
        ) : null}

        {footer ? (
          <div className="shrink-0 border-t border-border px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:px-6 md:pb-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

/** Existing name for the same primitive. */
export const Dialog = ResponsiveDialog;

/** Dialog actions: full-width and stacked on phones, right-aligned from sm up. */
export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}>{children}</div>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string | undefined;
  /** Says exactly what happens, e.g. "Delete snippet". */
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** The action is running: confirm shows a spinner and the dialog can't be dismissed. */
  pending?: boolean;
}

/** Asks before a destructive or irreversible action. Focus starts on Cancel. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  pending = false,
}: ConfirmDialogProps) {
  function close() {
    if (!pending) onClose();
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={close}
      title={title}
      description={description}
      size="sm"
      footer={
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close} disabled={pending} data-autofocus="">
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            loading={pending}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      }
    />
  );
}
