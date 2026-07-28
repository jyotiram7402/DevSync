"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Read-only Monaco viewer for snippet content. Lazy-loaded so Monaco stays off
 * the initial bundle. Content is rendered as text (never executed), so it is
 * safe against XSS.
 */
const SnippetEditor = dynamic(
  () => import("@/features/snippets/components/snippet-editor").then((mod) => mod.SnippetEditor),
  { ssr: false, loading: () => <Skeleton className="h-[420px] w-full" /> },
);

export function SnippetViewer({
  content,
  language,
  height = 420,
}: {
  content: string;
  language: string | null;
  height?: number;
}) {
  return <SnippetEditor value={content} language={language} readOnly height={height} />;
}
