import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@ext/utils/cn";

type Variant = "default" | "outline" | "ghost" | "destructive";

const VARIANTS: Record<Variant, string> = {
  default: "bg-brand text-brand-foreground hover:bg-brand/90",
  outline: "border border-input bg-background hover:bg-muted",
  ghost: "hover:bg-muted",
  destructive: "text-destructive hover:bg-destructive/10",
};

export function Button({
  variant = "default",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 role="status" aria-label={label} className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}

export function Feedback({ type, text }: { type: "success" | "error" | "info"; text: string }) {
  const tone =
    type === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : type === "error"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <p role="status" aria-live="polite" className={cn("px-3 text-xs", tone)}>
      {text}
    </p>
  );
}
