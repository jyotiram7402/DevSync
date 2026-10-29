import { Users } from "lucide-react";
import Link from "next/link";

import { SpaceJoinForm } from "@/features/spaces/components/space-join-form";

export const metadata = { title: "Join a room" };

/**
 * Join screen: /dashboard/spaces/join to type or paste a code, and
 * /dashboard/spaces/join/CODE from an invite link, with the code filled in.
 * The code is in the path, so it survives the redirect through sign-in.
 */
export default async function JoinSpacePage({ params }: { params: Promise<{ code?: string[] }> }) {
  const { code } = await params;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 md:pt-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-wash text-primary-ink">
          <Users className="size-6" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Join a room</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Enter the code someone shared with you. You&apos;ll see everything shared in the room, as it happens.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <SpaceJoinForm initialCode={code?.[0] ?? ""} />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Want a room of your own?{" "}
        <Link href="/dashboard/spaces" className="font-medium text-primary-ink underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
