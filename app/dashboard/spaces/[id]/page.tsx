import { redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { SpaceItemCard } from "@/features/spaces/components/space-item";
import { SpaceLiveRefresh } from "@/features/spaces/components/space-live-refresh";
import { SpaceRoomHeader } from "@/features/spaces/components/space-room-header";
import { SpaceShareBox } from "@/features/spaces/components/space-share-box";
import { getSpaceView } from "@/features/spaces/services/space-service";

export const metadata = { title: "Space" };

export default async function SpaceRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getSpaceView(id);

  // Not a member, or the room expired / doesn't exist → back to the lobby.
  if (!result.ok) redirect("/dashboard/spaces");

  const { space, items, memberCount, isOwner } = result.data;

  return (
    <div className="flex flex-col gap-4">
      <SpaceLiveRefresh spaceId={space.id} />

      <SpaceRoomHeader space={space} memberCount={memberCount} />

      <SpaceShareBox spaceId={space.id} />

      {items.length === 0 ? (
        <EmptyState
          title="Nothing shared yet"
          description="Share text, a link, or a file above — everyone in this room sees it instantly."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <SpaceItemCard key={item.id} item={item} isOwner={isOwner} />
          ))}
        </ul>
      )}
    </div>
  );
}
