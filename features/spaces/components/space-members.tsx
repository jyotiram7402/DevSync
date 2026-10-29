"use client";

import { UserMinus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog, ResponsiveDialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { removeMemberAction } from "@/features/spaces/actions";
import type { SpaceMember } from "@/features/spaces/types";

export function memberName(member: SpaceMember): string {
  return member.displayName ?? member.email ?? "Member";
}

/**
 * The people in a room, in a sheet. The owner can remove anyone else (it asks
 * first); removing someone also gives the room a new code, so they can't
 * rejoin with the one they know.
 */
export function SpaceMembersSheet({
  open,
  onClose,
  spaceId,
  members,
  isOwner,
}: {
  open: boolean;
  onClose: () => void;
  spaceId: string;
  members: SpaceMember[];
  isOwner: boolean;
}) {
  const [toRemove, setToRemove] = useState<SpaceMember | null>(null);
  const [removing, setRemoving] = useState(false);

  async function remove() {
    if (!toRemove) return;
    const target = toRemove;
    setRemoving(true);
    const result = await removeMemberAction(spaceId, target.userId);
    setRemoving(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setToRemove(null);
    toast.success(`Removed ${memberName(target)}. The room has a new code, so the old one no longer works.`);
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onClose={onClose}
        title={`People (${members.length})`}
        description="Everyone here sees what's shared in this room."
      >
        <ul className="-mx-2 flex flex-col">
          {members.map((member) => {
            const name = memberName(member);
            return (
              <li key={member.userId} className="flex min-h-14 items-center gap-3 rounded-md px-2 py-2">
                <span aria-hidden="true">
                  <Avatar name={name} size="md" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {name}
                    {member.isYou ? <span className="font-normal text-muted-foreground"> (you)</span> : null}
                  </p>
                  {member.email && member.displayName ? (
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  ) : null}
                </div>
                {member.isOwner ? (
                  <Badge variant="primary" className="shrink-0">
                    Owner
                  </Badge>
                ) : isOwner ? (
                  <IconButton
                    label={`Remove ${name}`}
                    icon={UserMinus}
                    size="sm"
                    onClick={() => setToRemove(member)}
                    className="shrink-0"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </ResponsiveDialog>

      <ConfirmDialog
        open={toRemove !== null}
        onClose={() => setToRemove(null)}
        onConfirm={() => void remove()}
        pending={removing}
        destructive
        title={toRemove ? `Remove ${memberName(toRemove)}?` : "Remove from room?"}
        description="They lose access to this room and everything in it. The room gets a new code, so the old code and links stop working."
        confirmLabel="Remove"
      />
    </>
  );
}
