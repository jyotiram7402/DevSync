import { ChevronRight, LogIn, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/ui/relative-time";
import { SpaceCreateButton } from "@/features/spaces/components/space-create-dialog";
import { joinPath } from "@/features/spaces/display";
import { listMySpaces } from "@/features/spaces/services/space-service";
import { getServerUser } from "@/lib/auth/session";

export const metadata = { title: "Spaces" };

const DESCRIPTION = "Rooms for a project. Share an error, code or a file in a room and everyone in it sees it right away.";

type SearchParams = Record<string, string | string[] | undefined>;

/** First letter of the room name (whole emoji included), for its tile. */
function initial(name: string): string {
  return (Array.from(name.trim())[0] ?? "S").toUpperCase();
}

export default async function SpacesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  // Invite links from before the join screen (/dashboard/spaces?join=CODE).
  if (typeof params.join === "string" && params.join.length > 0) redirect(joinPath(params.join));

  const [user, result] = await Promise.all([getServerUser(), listMySpaces()]);
  const empty = result.ok && result.data.length === 0;

  const joinButton = (
    <Button asChild variant="outline">
      <Link href="/dashboard/spaces/join">
        <LogIn aria-hidden="true" />
        Join with a code
      </Link>
    </Button>
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Spaces"
        description={DESCRIPTION}
        actions={
          // The empty state offers the same two actions, front and center.
          empty ? undefined : (
            <>
              {joinButton}
              <SpaceCreateButton />
            </>
          )
        }
      />

      {!result.ok ? (
        <ErrorState title="Couldn't load your rooms" description={result.error.message}>
          <Button asChild variant="outline">
            <Link href="/dashboard/spaces">Try again</Link>
          </Button>
        </ErrorState>
      ) : result.data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No rooms yet"
          description="Make a room for a project and invite the people helping you. Or join one with the code someone sent you."
          action={<SpaceCreateButton />}
          secondaryAction={joinButton}
        />
      ) : (
        <section aria-labelledby="your-rooms" className="flex flex-col gap-2">
          <h2 id="your-rooms" className="text-sm font-medium text-muted-foreground">
            Your rooms ({result.data.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {result.data.map((space) => (
              <li key={space.id}>
                <Link
                  href={`/dashboard/spaces/${space.id}`}
                  className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors duration-fast hover:border-input/60 active:bg-accent sm:p-4"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-md bg-wash text-base font-semibold text-primary-ink"
                  >
                    {initial(space.name)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">{space.name}</span>
                      {user && space.createdBy === user.id ? (
                        <Badge variant="primary" className="shrink-0">
                          Owner
                        </Badge>
                      ) : null}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Created <RelativeTime value={space.createdAt} />
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
