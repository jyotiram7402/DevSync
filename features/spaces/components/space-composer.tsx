"use client";

import { Code2, Paperclip, RotateCw, SendHorizontal, TriangleAlert, X } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";

import { FileIcon } from "@/components/ui/file-icon";
import { IconButton } from "@/components/ui/icon-button";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Textarea } from "@/components/ui/textarea";
import { kindFromMime } from "@/features/library/config";
import { shareFileAction, shareTextAction } from "@/features/spaces/actions";
import { useSupabase } from "@/hooks/use-supabase";
import { spaceAttachmentPath } from "@/lib/storage/paths";
import { uploadFile } from "@/lib/storage/storage";
import { announce } from "@/utils/announce";
import { cn } from "@/utils/cn";
import { formatBytes } from "@/utils/formatters";

/** Matches the space-attachments bucket limit. */
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const PHONE_QUERY = "(max-width: 767px)";

type Category = "error" | "code";

const CATEGORY_OPTIONS = [
  { value: "error", label: "Error", icon: TriangleAlert },
  { value: "code", label: "Code", icon: Code2 },
] as const;

interface Upload {
  id: string;
  file: File;
  status: "uploading" | "failed";
  error?: string;
  /** Set once the bytes are stored, so Retry only has to register the item. */
  path?: string;
  /** False when trying again can't help (the file is too large). */
  retryable: boolean;
}

function tooLargeMessage(file: File): string | null {
  if (file.size <= MAX_FILE_BYTES) return null;
  return `That file is ${formatBytes(file.size, 1)}. Files can be up to ${formatBytes(MAX_FILE_BYTES)}.`;
}

/** True while any dialog or sheet is open (drops then belong to it, not the room). */
function modalOpen(): boolean {
  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null;
}

/**
 * The room's composer: paste an error, code or a link and share it, or
 * attach files (also by pasting an image, or by dropping files anywhere on
 * the page on desktop). Text is shared exactly as pasted.
 *
 * Phones: docked to the bottom, above the tab bar; while typing (the tab bar
 * hides) it rides on top of the keyboard. md+: a card at the top of the room.
 * Each upload shows its own status, with Retry when it fails.
 */
export function SpaceComposer({ spaceId, roomName }: { spaceId: string; roomName: string }) {
  const supabase = useSupabase();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("error");
  const [sending, setSending] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [focused, setFocused] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Grow with the text (CSS caps the height; it scrolls inside after that).
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [text]);

  // Phones: tell the page how tall the dock is, so the end of the feed can scroll clear of it.
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock || typeof ResizeObserver === "undefined") return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty("--dock-height", `${dock.offsetHeight}px`);
    });
    observer.observe(dock);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--dock-height");
    };
  }, []);

  // Phones, while typing: sit on top of the on-screen keyboard. Browsers that
  // resize the page for the keyboard report no inset; iOS Safari overlays it.
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!focused || !viewport || !window.matchMedia(PHONE_QUERY).matches) {
      setKeyboardInset(0);
      return;
    }
    const visual: VisualViewport = viewport;
    function update() {
      const inset = window.innerHeight - visual.height - visual.offsetTop;
      setKeyboardInset(inset > 1 ? Math.round(inset) : 0);
    }
    update();
    visual.addEventListener("resize", update);
    visual.addEventListener("scroll", update);
    return () => {
      visual.removeEventListener("resize", update);
      visual.removeEventListener("scroll", update);
    };
  }, [focused]);

  function fail(id: string, error: string, path?: string) {
    setUploads((list) =>
      list.map((entry) => (entry.id === id ? { ...entry, status: "failed", error, path: path ?? entry.path } : entry)),
    );
  }

  async function runUpload(upload: Upload) {
    setUploads((list) =>
      list.map((entry) => (entry.id === upload.id ? { ...entry, status: "uploading", error: undefined } : entry)),
    );
    const mimeType = upload.file.type || "application/octet-stream";

    let path = upload.path;
    if (!path) {
      const uploaded = await uploadFile(supabase, {
        bucket: "space-attachments",
        path: spaceAttachmentPath(spaceId, crypto.randomUUID(), upload.file.name),
        file: upload.file,
        contentType: mimeType,
      });
      if (!uploaded.ok) {
        fail(upload.id, uploaded.error.message);
        return;
      }
      path = uploaded.data.path;
    }

    const result = await shareFileAction(spaceId, {
      path,
      name: upload.file.name,
      mimeType,
      size: upload.file.size,
      kind: kindFromMime(mimeType),
    });
    if (!result.ok) {
      fail(upload.id, result.error.message, path);
      return;
    }
    setUploads((list) => list.filter((entry) => entry.id !== upload.id));
    announce("File shared");
  }

  function addFiles(files: File[]) {
    const added = files.map((file): Upload => {
      const tooLarge = tooLargeMessage(file);
      return tooLarge
        ? { id: crypto.randomUUID(), file, status: "failed", error: tooLarge, retryable: false }
        : { id: crypto.randomUUID(), file, status: "uploading", retryable: true };
    });
    setUploads((list) => [...list, ...added]);
    for (const upload of added) {
      if (upload.status === "uploading") void runUpload(upload);
    }
  }

  // Desktop: drop files anywhere on the page. The listeners are added once, so
  // they call the latest addFiles through a ref.
  const addFilesRef = useRef(addFiles);
  useEffect(() => {
    addFilesRef.current = addFiles;
  });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let depth = 0;
    const hasFiles = (event: DragEvent) => event.dataTransfer?.types.includes("Files") ?? false;

    function handleDragEnter(event: DragEvent) {
      if (!hasFiles(event) || modalOpen()) return;
      depth += 1;
      setDragging(true);
    }
    // Always cancel file drags, so a missed drop never opens the file in place of the app.
    function handleDragOver(event: DragEvent) {
      if (hasFiles(event)) event.preventDefault();
    }
    function handleDragLeave(event: DragEvent) {
      if (!hasFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    }
    function handleDrop(event: DragEvent) {
      depth = 0;
      setDragging(false);
      if (!hasFiles(event)) return;
      event.preventDefault();
      if (modalOpen()) return;
      const files = Array.from(event.dataTransfer?.files ?? []);
      if (files.length > 0) addFilesRef.current(files);
    }

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  async function sendText() {
    if (sending || text.trim().length === 0) return;
    setSending(true);
    // Shared exactly as pasted: Copy must give back the original.
    const result = await shareTextAction(spaceId, { content: text, category });
    setSending(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setText("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void sendText();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(event.clipboardData.files);
    if (files.length === 0) return;
    event.preventDefault();
    addFiles(files);
  }

  const expanded = focused || text.length > 0;

  return (
    <>
      <div
        ref={dockRef}
        data-dock=""
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        style={{ "--keyboard-inset": `${keyboardInset}px` } as CSSProperties}
        className="fixed inset-x-0 bottom-[calc(var(--dock-bottom,0px)_+_var(--keyboard-inset,0px))] z-sticky border-t border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85 md:static md:z-auto md:rounded-lg md:border md:bg-card md:backdrop-blur-none md:supports-[backdrop-filter]:bg-card"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2 md:p-3">
          {uploads.length > 0 ? (
            <ul aria-label="Uploads" className="flex flex-col gap-1.5">
              {uploads.map((upload) => (
                <li
                  key={upload.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1.5"
                >
                  <FileIcon name={upload.file.name} mimeType={upload.file.type} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{upload.file.name}</p>
                    {upload.status === "uploading" ? (
                      <Progress value={null} label={`Uploading ${upload.file.name}`} className="mt-1.5" />
                    ) : (
                      <p role="alert" className="text-xs text-destructive">
                        {upload.error}
                      </p>
                    )}
                  </div>
                  {upload.status === "failed" ? (
                    <div className="flex shrink-0 items-center">
                      {upload.retryable ? (
                        <IconButton
                          label={`Try ${upload.file.name} again`}
                          icon={RotateCw}
                          size="sm"
                          onClick={() => void runUpload(upload)}
                        />
                      ) : null}
                      <IconButton
                        label={`Dismiss ${upload.file.name}`}
                        icon={X}
                        size="sm"
                        onClick={() => setUploads((list) => list.filter((entry) => entry.id !== upload.id))}
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          <div className={cn("items-center justify-between gap-2", expanded ? "flex" : "hidden md:flex")}>
            <SegmentedControl
              aria-label="Share as"
              size="sm"
              options={CATEGORY_OPTIONS}
              value={category}
              onValueChange={setCategory}
            />
            <span className="hidden text-xs text-muted-foreground pointer-fine:inline">Ctrl or ⌘ + Enter to share</span>
          </div>

          <div className="flex items-end gap-1.5">
            <IconButton
              label="Attach files"
              icon={Paperclip}
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0"
            />
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              rows={1}
              aria-label={`Share to ${roomName}`}
              placeholder={category === "error" ? "Paste an error or a stack trace…" : "Paste code, a command or a link…"}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="max-h-40 min-h-10 resize-none overflow-y-auto py-2 pointer-coarse:min-h-11 md:max-h-64 md:min-h-16"
            />
            <IconButton
              label="Share"
              icon={SendHorizontal}
              variant="default"
              // Keep the keyboard open after sending (the button doesn't take focus).
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void sendText()}
              loading={sending}
              disabled={text.trim().length === 0}
              className="shrink-0"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (files.length > 0) addFiles(files);
            }}
          />
        </div>
      </div>

      {dragging ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-overlay flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm"
        >
          <div className="flex max-w-sm flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary bg-wash px-10 py-8 text-center">
            <Paperclip className="size-6 text-primary-ink" aria-hidden="true" />
            <p className="text-base font-semibold [overflow-wrap:anywhere]">Drop to share in {roomName}</p>
            <p className="text-sm text-muted-foreground">Up to 10 MB per file</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
