"use client";

import { ClipboardPaste, CodeXml, Link2, ListTodo, Upload, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRef, type ChangeEvent } from "react";

import { ResponsiveDialog } from "@/components/ui/dialog";
import { KIND_TONE_TILE } from "@/components/ui/kind-badge";
import { useQuickCapture } from "@/features/capture/quick-capture-provider";
import { NAV_NOTES } from "@/lib/dashboard/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/cn";

const CLIPBOARD_BLOCKED_NOTE =
  "Your browser didn't share the clipboard. Long-press the box below and tap Paste.";
const CLIPBOARD_EMPTY_NOTE = "Your clipboard is empty. Copy something first, or type below.";

/**
 * The phone "Add" sheet (＋ in the bottom bar): the one place to add anything.
 * Paste reads the clipboard inside the tap (where the browser allows it) and
 * hands the text to Quick add; upload opens the file picker from the same tap.
 */
export function AddSheet() {
  const open = useUIStore((state) => state.addSheetOpen);
  const setOpen = useUIStore((state) => state.setAddSheetOpen);
  const { openWith } = useQuickCapture();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function close() {
    setOpen(false);
  }

  async function pasteFromClipboard() {
    let text: string | null = null;
    try {
      // Has to start inside the tap: browsers only share the clipboard on a user gesture.
      text = await navigator.clipboard.readText();
    } catch {
      text = null;
    }
    close();
    if (text === null) openWith({ note: CLIPBOARD_BLOCKED_NOTE });
    else if (text.length === 0) openWith({ note: CLIPBOARD_EMPTY_NOTE });
    else openWith({ text });
  }

  function addFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    close();
    openWith({ file });
  }

  function addLink() {
    close();
    openWith({ placeholder: "Paste a link, like https://…" });
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={close}
      title="Add"
      description="Whatever you add shows up on all your devices."
    >
      <ul className="-mx-2 flex flex-col">
        <li>
          <AddRow
            icon={ClipboardPaste}
            tile="bg-primary/10 text-primary-ink"
            title="Paste from clipboard"
            detail="Save what you just copied"
            onClick={() => void pasteFromClipboard()}
          />
        </li>
        <li>
          <AddRow
            icon={CodeXml}
            tile={KIND_TONE_TILE.code}
            title="New snippet"
            detail="Code, a command or an error, with a title"
            href="/dashboard/snippets/new"
            onClick={close}
          />
        </li>
        <li>
          <AddRow
            icon={Upload}
            tile={KIND_TONE_TILE.image}
            title="Upload a photo or file"
            detail="Images, PDFs, documents, up to 10 MB"
            onClick={() => fileInputRef.current?.click()}
          />
        </li>
        <li>
          <AddRow
            icon={Link2}
            tile={KIND_TONE_TILE.link}
            title="Add a link"
            detail="Save a web address to Links"
            onClick={addLink}
          />
        </li>
        <li>
          <AddRow
            icon={ListTodo}
            tile={KIND_TONE_TILE.note}
            title="New note"
            detail="A to-do or a reminder"
            href={NAV_NOTES.href}
            onClick={close}
          />
        </li>
      </ul>
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={addFile}
      />
    </ResponsiveDialog>
  );
}

function AddRow({
  icon: Icon,
  tile,
  title,
  detail,
  href,
  onClick,
}: {
  icon: LucideIcon;
  tile: string;
  title: string;
  detail: string;
  href?: string;
  onClick: () => void;
}) {
  const className =
    "flex min-h-14 w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-fast hover:bg-accent active:bg-accent";
  const content = (
    <>
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", tile)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">{detail}</span>
      </span>
    </>
  );

  if (href !== undefined) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
