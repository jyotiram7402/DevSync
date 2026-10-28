import { redirect } from "next/navigation";

import { BreadcrumbLabel } from "@/components/dashboard/breadcrumb-label";
import { SpaceComposer } from "@/features/spaces/components/space-composer";
import { SpaceFeed } from "@/features/spaces/components/space-feed";
import { SpaceLiveRefresh } from "@/features/spaces/components/space-live-refresh";
import { SpaceRoomHeader } from "@/features/spaces/components/space-room-header";
import { getSpaceView } from "@/features/spaces/services/space-service";

export const metadata = { title: "Space" };

export default async function SpaceRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getSpaceView(id);

  // Not a member, or the room doesn't exist → back to the list.
  if (!result.ok) redirect("/dashboard/spaces");

  const { space, items, members, isOwner } = result.data;

  return (
    // On phones the composer is docked at the bottom; the feed ends clear of it.
    <div className="flex flex-col gap-4 pb-[var(--dock-height,0px)] md:gap-5 md:pb-0">
      <BreadcrumbLabel label={space.name} />
      <SpaceLiveRefresh spaceId={space.id} />

      <SpaceRoomHeader space={space} members={members} isOwner={isOwner} />
      <SpaceComposer spaceId={space.id} roomName={space.name} />
      <SpaceFeed items={items} isOwner={isOwner} />
    </div>
  );
}
