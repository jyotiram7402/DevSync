"use client";

import { Loader2, UserMinus, UserPlus, Users } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { inviteMemberAction, removeMemberAction } from "@/features/spaces/actions";
import type { SpaceMember } from "@/features/spaces/types";

function memberName(member: SpaceMember): string {
  return member.displayName ?? member.email ?? "Member";
}

/** "People" panel: roster, invite by email, and owner-only removal. */
export function SpaceMembers({
  spaceId,
  members,
  isOwner,
}: {
  spaceId: string;
  members: SpaceMember[];
  isOwner: boolean;
}) {
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [toRemove, setToRemove] = useState<SpaceMember | null>(null);
  const [isRemoving, startRemove] = useTransition();

  async function invite() {
    const value = email.trim();
    if (value.length === 0) return;
    setInviting(true);
    const res = await inviteMemberAction(spaceId, { email: value });
    setInviting(false);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    setEmail("");
    toast.success(
      res.data.status === "already_member" ? "They're already in this room." : `Added ${value} to the room.`,
    );
  }

  function confirmRemove() {
    if (!toRemove) return;
    const target = toRemove;
    startRemove(async () => {
      const res = await removeMemberAction(spaceId, target.userId);
      if (!res.ok) {
        toast.error(res.error.message);
        return;
      }
      toast.success(`Removed ${memberName(target)}.`);
      setToRemove(null);
    });
  }

  return (
    <>
    <details className="group rounded-xl border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="flex items-center gap-2">
          <Users className="size-4 text-brand" aria-hidden="true" />
          People ({members.length})
        </span>
        <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
        <span className="hidden text-xs text-muted-foreground group-open:inline">Hide</span>
      </summary>

      <div className="flex flex-col gap-4 border-t px-4 py-4">
        <div className="flex flex-col gap-2">
          <label htmlFor={`invite-${spaceId}`} className="text-xs text-muted-foreground">
            Add someone who already has a CopyAnywhere account
          </label>
          <div className="flex items-center gap-2">
            <Input
              id={`invite-${spaceId}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") void invite();
              }}
            />
            <Button type="button" onClick={() => void invite()} disabled={inviting || email.trim().length === 0}>
              {inviting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              Add
            </Button>
          </div>
        </div>

        <ul className="flex flex-col divide-y">
          {members.map((member) => (
            <li key={member.userId} className="flex items-center gap-3 py-2">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground"
                aria-hidden="true"
              >
                {memberName(member).slice(0, 1)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm">
                  {memberName(member)}
                  {member.isYou ? <span className="text-muted-foreground"> (you)</span> : null}
                </span>
                {member.email && member.displayName ? (
                  <span className="truncate text-xs text-muted-foreground">{member.email}</span>
                ) : null}
              </span>
              {member.isOwner ? (
                <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
                  Owner
                </span>
              ) : isOwner ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setToRemove(member)}
                  aria-label={`Remove ${memberName(member)}`}
                >
                  <UserMinus className="size-4 text-muted-foreground" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </details>

      <Dialog
        open={toRemove !== null}
        onClose={() => setToRemove(null)}
        title="Remove from room?"
        description={
          toRemove ? `${memberName(toRemove)} will lose access to this room and everything in it.` : undefined
        }
      >
        <DialogFooter>
          <Button variant="outline" onClick={() => setToRemove(null)} disabled={isRemoving}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmRemove} disabled={isRemoving} aria-busy={isRemoving}>
            {isRemoving ? "Removing…" : "Remove"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
