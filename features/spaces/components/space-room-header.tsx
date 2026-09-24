"use client";

import { Check, Copy, Link2, LogOut, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { deleteSpaceAction, leaveSpaceAction } from "@/features/spaces/actions";
import type { Space } from "@/features/spaces/types";

export function SpaceRoomHeader({
  space,
  memberCount,
  isOwner,
}: {
  space: Space;
  memberCount: number;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState<null | "code" | "link">(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  function confirmExit() {
    startTransition(async () => {
      const res = isOwner ? await deleteSpaceAction(space.id) : await leaveSpaceAction(space.id);
      if (!res.ok) {
        toast.error(res.error.message);
        return;
      }
      toast.success(isOwner ? "Room deleted." : "You left the room.");
      router.push("/dashboard/spaces");
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-xl font-semibold tracking-tight">{space.name}</h1>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" />
            {memberCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Room code</span>
          <button
            type="button"
            onClick={() => void copy("code")}
            className="inline-flex items-center gap-2 rounded-md border bg-background px-2.5 py-1 font-mono text-sm font-semibold tracking-widest transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Copy room code ${space.code}`}
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
        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
          {isOwner ? <Trash2 className="size-4" /> : <LogOut className="size-4" />}
          {isOwner ? "Delete room" : "Leave"}
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={isOwner ? "Delete this room?" : "Leave this room?"}
        description={
          isOwner
            ? `"${space.name}" and everything shared in it — including files — will be permanently deleted for all members.`
            : `You'll lose access to "${space.name}" until someone invites you again.`
        }
      >
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={isOwner ? "destructive" : "default"}
            onClick={confirmExit}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? "Working…" : isOwner ? "Delete room" : "Leave room"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
