"use client";

import { useEffect, useState } from "react";

import { cn } from "@/utils/cn";

/**
 * Cycles a single word/phrase with an enter animation. The full list is
 * rendered once, visually hidden, so the headline still reads completely to
 * screen readers and search engines (`aria-hidden` on the animated copy).
 */
export function RotatingWords({
  words,
  intervalMs = 2200,
  className,
}: {
  words: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % words.length), intervalMs);
    return () => clearInterval(timer);
  }, [words.length, intervalMs]);

  const word = words[index] ?? words[0] ?? "";

  return (
    <span className={cn("relative inline-block align-bottom", className)}>
      {/* Reserves the widest possible width so the headline never reflows. */}
      <span className="invisible block" aria-hidden="true">
        {words.reduce((a, b) => (a.length >= b.length ? a : b), "")}
      </span>
      <span
        key={index}
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-brand to-brand-accent bg-clip-text text-transparent motion-safe:animate-word-in"
      >
        {word}
      </span>
      <span className="sr-only">{words.join(", ")}</span>
    </span>
  );
}
