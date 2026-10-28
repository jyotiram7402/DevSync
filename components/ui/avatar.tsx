import { cn } from "@/utils/cn";

/**
 * Avatar + AvatarStack — a person's picture with an initials fallback.
 * Presentational (no hooks), so it renders in server or client components.
 * Pictures come from the sign-in provider (Google/GitHub), which isn't on the
 * Next Image allow-list, so a plain <img> with fixed dimensions is used.
 */
const SIZES = {
  xs: { className: "size-6 text-xs", px: 24 },
  sm: { className: "size-8 text-xs", px: 32 },
  md: { className: "size-10 text-sm", px: 40 },
  lg: { className: "size-12 text-base", px: 48 },
} as const;

export type AvatarSize = keyof typeof SIZES;

export function getInitials(name: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  const initials = (first + last).toUpperCase();
  return initials.length > 0 ? initials : "U";
}

interface AvatarProps {
  name: string | null;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ name, src, size = "sm", className }: AvatarProps) {
  const label = name ?? "User";
  const { className: sizeClass, px } = SIZES[size];
  const classes = cn(
    "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-foreground",
    sizeClass,
    className,
  );

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={cn(classes, "object-cover")}
      />
    );
  }

  return (
    <span role="img" aria-label={label} className={classes}>
      {getInitials(name)}
    </span>
  );
}

interface AvatarStackProps {
  people: ReadonlyArray<{ id: string; name: string | null; src?: string | null }>;
  /** How many faces to show before "+N". */
  max?: number;
  size?: AvatarSize;
  className?: string;
}

/** Overlapping avatars for a room's members, then "+N" for the rest. */
export function AvatarStack({ people, max = 4, size = "sm", className }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const hidden = people.length - shown.length;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {shown.map((person) => (
        <Avatar key={person.id} name={person.name} src={person.src} size={size} className="ring-2 ring-background" />
      ))}
      {hidden > 0 ? (
        <span
          role="img"
          aria-label={`${hidden} more`}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background",
            SIZES[size].className,
          )}
        >
          +{hidden}
        </span>
      ) : null}
    </div>
  );
}
