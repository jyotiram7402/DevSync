import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { SpaceCreateJoin } from "@/features/spaces/components/space-create-join";
import { listMySpaces } from "@/features/spaces/services/space-service";

export const metadata = { title: "Spaces" };

function createdLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `created ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

export default async function SpacesPage() {
  const result = await listMySpaces();
  const spaces = result.ok ? result.data : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Spaces"
        description="Project rooms. Keep each project's errors, code, docs and files in one place — and solve them together, live."
      />

      <Suspense fallback={<div className="h-40 rounded-xl border" />}>
        <SpaceCreateJoin />
      </Suspense>

      {spaces.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Your rooms</h2>
          <ul className="flex flex-col gap-2">
            {spaces.map((space) => (
              <li key={space.id}>
                <Link
                  href={`/dashboard/spaces/${space.id}`}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Users className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{space.name}</span>
                    <span className="text-xs text-muted-foreground">
                      <span className="font-mono tracking-widest">{space.code}</span>
                      {" · "}
                      {createdLabel(space.createdAt)}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
