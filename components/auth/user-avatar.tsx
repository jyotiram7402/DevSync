import { Avatar } from "@/components/ui/avatar";

/**
 * The signed-in user's avatar with an initials fallback — a thin wrapper over
 * the Avatar primitive, kept for existing callers.
 */
interface UserAvatarProps {
  name: string | null;
  avatarUrl: string | null;
  className?: string;
}

export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  return <Avatar name={name} src={avatarUrl} className={className} />;
}
