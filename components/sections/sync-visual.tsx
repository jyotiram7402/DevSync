"use client";

import {
  Check,
  Chrome,
  Cloud,
  Code2,
  FileText,
  Image as ImageIcon,
  Laptop,
  Link2,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/utils/cn";

/**
 * The hero's product proof: a looping animation of content leaving a phone,
 * crossing the cloud, and landing on a laptop + browser extension. Cycles
 * through the content types the product actually supports.
 *
 * Purely decorative — hidden from assistive tech; the surrounding copy conveys
 * the same meaning. Respects prefers-reduced-motion via Tailwind's motion-safe.
 */
interface Payload {
  label: string;
  icon: LucideIcon;
  tint: string;
  preview: string;
}

const PAYLOADS: Payload[] = [
  { label: "Image", icon: ImageIcon, tint: "from-sky-400 to-blue-500", preview: "screenshot.png" },
  { label: "Code", icon: Code2, tint: "from-violet-400 to-purple-500", preview: "useAuth.ts" },
  { label: "PDF", icon: FileText, tint: "from-rose-400 to-red-500", preview: "invoice.pdf" },
  { label: "Link", icon: Link2, tint: "from-emerald-400 to-teal-500", preview: "vercel.com/docs" },
];

const CYCLE_MS = 2800;

function Device({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {active ? (
          <span className="absolute inset-0 rounded-2xl bg-brand/40 motion-safe:animate-pulse-ring" />
        ) : null}
        <div
          className={cn(
            "relative flex size-14 items-center justify-center rounded-2xl border bg-card transition-all duration-500 sm:size-16",
            active ? "border-brand/60 shadow-glow" : "border-border",
          )}
        >
          <Icon
            className={cn(
              "size-6 transition-colors duration-500 sm:size-7",
              active ? "text-brand" : "text-muted-foreground",
            )}
          />
        </div>
      </div>
      <span className="text-[11px] font-medium text-muted-foreground sm:text-xs">{label}</span>
    </div>
  );
}

export function SyncVisual() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % PAYLOADS.length), CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  const payload = PAYLOADS[index] ?? PAYLOADS[0];
  if (!payload) return null;
  const PayloadIcon = payload.icon;

  return (
    <div
      aria-hidden="true"
      className="relative w-full max-w-4xl overflow-hidden rounded-2xl border bg-card/60 p-6 shadow-premium backdrop-blur-sm sm:p-10"
    >
      {/* Ambient brand wash */}
      <div className="pointer-events-none absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-brand/10 blur-[100px]" />

      <div className="relative flex items-center justify-between gap-2 sm:gap-6">
        <Device icon={Smartphone} label="Android" active />

        {/* Path: phone → cloud */}
        <div className="relative h-px flex-1 bg-gradient-to-r from-brand/50 to-brand-accent/50">
          <div className="absolute inset-0 flex items-center">
            <span
              key={`a-${index}`}
              className={cn(
                "size-2 rounded-full bg-gradient-to-r shadow-glow motion-safe:animate-travel-right",
                payload.tint,
              )}
            />
          </div>
        </div>

        <Device icon={Cloud} label="Realtime" active />

        {/* Path: cloud → devices */}
        <div className="relative h-px flex-1 bg-gradient-to-r from-brand-accent/50 to-brand/50">
          <div className="absolute inset-0 flex items-center">
            <span
              key={`b-${index}`}
              className={cn(
                "size-2 rounded-full bg-gradient-to-r shadow-glow motion-safe:animate-travel-right",
                payload.tint,
              )}
              style={{ animationDelay: "600ms" }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Device icon={Laptop} label="Web" active />
          <Device icon={Chrome} label="Extension" active />
        </div>
      </div>

      {/* The payload card currently in flight */}
      <div className="relative mt-8 flex items-center justify-center">
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border bg-background/80 px-4 py-3 shadow-soft motion-safe:animate-scale-in"
        >
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-lg bg-gradient-to-br text-white",
              payload.tint,
            )}
          >
            <PayloadIcon className="size-4" />
          </span>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-medium">{payload.preview}</p>
            <p className="text-xs text-muted-foreground">
              {payload.label} · synced to 3 devices
            </p>
          </div>
          <span className="ml-2 flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
            <Check className="size-3" />
            Live
          </span>
        </div>
      </div>

      {/* Type ticker */}
      <div className="relative mt-6 flex items-center justify-center gap-1.5">
        {PAYLOADS.map((item, i) => (
          <span
            key={item.label}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              i === index ? "w-6 bg-brand" : "w-1.5 bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
