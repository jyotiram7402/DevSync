"use client";

import { LogOut, Trash2, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AvatarStack } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { deleteSpaceAction, leaveSpaceAction } from "@/features/spaces/actions";
import { SpaceInviteSheet } from "@/features/spaces/components/space-invite-sheet";
import { memberName, SpaceMembersSheet } from "@/features/spaces/components/space-members";
import type { Space, SpaceMember } from "@/features/spaces/types";

/**
 * Room header: the name, who's in it (opens the people sheet), Invite, and a
 * menu to leave the room — or, for the owner, to delete it (both ask first).
 */
export function SpaceRoomHeader({
  space,
  members,
  isOwner,
}: {
  space: Space;
  members: SpaceMember[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [exiting, setExiting] = useState(false);

  async function exit() {
    setExiting(true);
    const result = isOwner ? await deleteSpaceAction(space.id) : await leaveSpaceAction(space.id);
    if (!result.ok) {
      setExiting(false);
      toast.error(result.error.message);
      return;
    }
    toast.success(isOwner ? "Room deleted." : "You left the room.");
    router.push("/dashboard/spaces");
    // The sidebar lists rooms by name; refresh it too.
    router.refresh();
  }

  const menuItems: MenuEntry[] = [
    { label: "Invite people", icon: UserPlus, onSelect: () => setInviteOpen(true) },
    { label: "People", icon: Users, onSelect: () => setPeopleOpen(true) },
    "separator",
    isOwner
      ? { label: "Delete room", icon: Trash2, destructive: true, onSelect: () => setConfirmExit(true) }
      : { label: "Leave room", icon: LogOut, onSelect: () => setConfirmExit(true) },
  ];

  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight [overflow-wrap:anywhere] md:text-2xl">{space.name}</h1>
        <button
          type="button"
          onClick={() => setPeopleOpen(true)}
          className="-ml-1 flex w-fit items-center gap-2 rounded-md px-1 py-1 text-sm text-muted-foreground transition-colors duration-fast hover:text-foreground active:bg-accent pointer-coarse:min-h-11"
        >
          <span aria-hidden="true">
            <AvatarStack people={members.map((member) => ({ id: member.userId, name: memberName(member) }))} size="xs" />
          </span>
          {members.length === 1 ? "Just you" : `${members.length} people`}
          <span className="sr-only"> in this room. Show people</span>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button type="button" variant="outline" size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus aria-hidden="true" />
          Invite
        </Button>
        <Menu label="Room options" items={menuItems} />
      </div>

      <SpaceInviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} space={space} isOwner={isOwner} />
      <SpaceMembersSheet
        open={peopleOpen}
        onClose={() => setPeopleOpen(false)}
        spaceId={space.id}
        members={members}
        isOwner={isOwner}
      />
      <ConfirmDialog
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        onConfirm={() => void exit()}
        pending={exiting}
        destructive={isOwner}
        title={isOwner ? "Delete this room?" : "Leave this room?"}
        description={
          isOwner
            ? `"${space.name}" and everything shared in it, files included, are deleted for everyone. This can't be undone.`
            : `You'll lose access to "${space.name}" until someone invites you again.`
        }
        confirmLabel={isOwner ? "Delete room" : "Leave room"}
      />
    </header>
  );
}
