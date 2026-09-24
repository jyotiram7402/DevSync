import { redirect } from "next/navigation";

import { SpaceFeed } from "@/features/spaces/components/space-feed";
import { SpaceLiveRefresh } from "@/features/spaces/components/space-live-refresh";
import { SpaceMembers } from "@/features/spaces/components/space-members";
import { SpaceRoomHeader } from "@/features/spaces/components/space-room-header";
import { SpaceShareBox } from "@/features/spaces/components/space-share-box";
import { getSpaceView } from "@/features/spaces/services/space-service";

export const metadata = { title: "Space" };

export default async function SpaceRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getSpaceView(id);

  // Not a member, or the room doesn't exist → back to the lobby.
  if (!result.ok) redirect("/dashboard/spaces");

  const { space, items, members, isOwner } = result.data;

  return (
    <div className="flex flex-col gap-4">
      <SpaceLiveRefresh spaceId={space.id} />

      <SpaceRoomHeader space={space} memberCount={members.length} isOwner={isOwner} />

      <SpaceMembers spaceId={space.id} members={members} isOwner={isOwner} />

      <SpaceShareBox spaceId={space.id} />

      <SpaceFeed items={items} isOwner={isOwner} />
    </div>
  );
}
