import { cn } from "@/utils/cn";

/**
 * User avatar with an initials fallback. Presentational (no hooks) so it can
 * render in server or client contexts. Uses a plain <img> because avatar URLs
 * come from arbitrary external providers (GitHub/Google) that are not part of
 * the Next Image remote allow-list.
 */
function getInitials(name: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  const initials = (first + last).toUpperCase();
  return initials.length > 0 ? initials : "U";
}

interface UserAvatarProps {
  name: string | null;
  avatarUrl: string | null;
  className?: string;
}

export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  const label = name ?? "User";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={label}
        width={32}
        height={32}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={cn("size-8 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-label={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground",
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
