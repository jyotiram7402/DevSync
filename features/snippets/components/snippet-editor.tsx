"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/utils/cn";

/**
 * Monaco-based code editor. Read-only or editable, theme-integrated, word-wrap
 * on, minimap off. Loaded lazily by consumers via next/dynamic (ssr: false).
 * Architecture is ready for future minimap/diff/AI enhancements via `options`.
 */
export interface SnippetEditorProps {
  value: string;
  language?: string | null;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: number;
  wordWrap?: boolean;
  className?: string;
}

export function SnippetEditor({
  value,
  language,
  onChange,
  readOnly = false,
  height = 360,
  wordWrap = true,
  className,
}: SnippetEditorProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const theme = mounted && resolvedTheme === "dark" ? "vs-dark" : "vs";

  return (
    <div className={cn("overflow-hidden rounded-md border", className)}>
      <Editor
        height={height}
        language={language ?? "plaintext"}
        value={value}
        theme={theme}
        onChange={(next) => onChange?.(next ?? "")}
        loading={
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading editor…
          </div>
        }
        options={{
          readOnly,
          domReadOnly: readOnly,
          minimap: { enabled: false },
          wordWrap: wordWrap ? "on" : "off",
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: "on",
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: readOnly ? "none" : "line",
          scrollbar: { alwaysConsumeMouseWheel: false },
        }}
      />
    </div>
  );
}
