"use client";

import { Check, Copy, LogOut, Link2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { leaveSpaceAction } from "@/features/spaces/actions";
import type { Space } from "@/features/spaces/types";

function expiresLabel(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return "expired";
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `expires in ${hours}h`;
  const mins = Math.max(1, Math.floor(ms / 60_000));
  return `expires in ${mins}m`;
}

export function SpaceRoomHeader({
  space,
  memberCount,
}: {
  space: Space;
  memberCount: number;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState<null | "code" | "link">(null);
  const [leaving, setLeaving] = useState(false);

  async function copy(kind: "code" | "link") {
    const text =
      kind === "code"
        ? space.code
        : `${window.location.origin}/dashboard/spaces?join=${space.code}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
      toast.success(kind === "code" ? "Code copied." : "Invite link copied.");
    } catch {
      toast.error("Couldn't copy — copy it manually.");
    }
  }

  async function leave() {
    setLeaving(true);
    const res = await leaveSpaceAction(space.id);
    if (!res.ok) {
      setLeaving(false);
      toast.error(res.error.message);
      return;
    }
    router.push("/dashboard/spaces");
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{space.name}</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" />
            {memberCount}
          </span>
          <span className="text-xs text-muted-foreground">{expiresLabel(space.expiresAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Room code</span>
          <button
            type="button"
            onClick={() => void copy("code")}
            className="inline-flex items-center gap-2 rounded-md border bg-background px-2.5 py-1 font-mono text-sm font-semibold tracking-widest transition-colors hover:bg-secondary/50"
            aria-label="Copy room code"
          >
            {space.code}
            {copied === "code" ? (
              <Check className="size-3.5 text-brand" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5 text-muted-foreground" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void copy("link")}>
          {copied === "link" ? <Check className="size-4" /> : <Link2 className="size-4" />}
          Invite link
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => void leave()} disabled={leaving}>
          <LogOut className="size-4" />
          Leave
        </Button>
      </div>
    </div>
  );
}
