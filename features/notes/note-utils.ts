import type { NotePriority } from "@/features/notes/types";

/** Human due-date label + tone, relative to today. Pure. */
export function dueMeta(
  dueDate: string | null,
  dueTime: string | null,
): { label: string; tone: "overdue" | "today" | "upcoming" } | null {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  const time = dueTime ? ` · ${dueTime}` : "";

  if (diffDays < 0) return { label: `Overdue${time}`, tone: "overdue" };
  if (diffDays === 0) return { label: `Today${time}`, tone: "today" };
  if (diffDays === 1) return { label: `Tomorrow${time}`, tone: "upcoming" };
  if (diffDays < 7) {
    const weekday = due.toLocaleDateString(undefined, { weekday: "short" });
    return { label: `${weekday}${time}`, tone: "upcoming" };
  }
  return {
    label: due.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + time,
    tone: "upcoming",
  };
}

export const PRIORITY_TONE: Record<NotePriority, string> = {
  high: "text-red-500 bg-red-500/10",
  medium: "text-amber-500 bg-amber-500/10",
  low: "text-muted-foreground bg-muted",
};
