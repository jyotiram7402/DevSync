"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/features/snippets/components/favorite-button";
import { SnippetMenu } from "@/features/snippets/components/snippet-menu";
import type { SnippetPermissions } from "@/features/snippets/permissions";
import type { Snippet } from "@/features/snippets/types";

/** Action cluster for the snippet detail header. */
export function SnippetActions({
  snippet,
  permissions,
}: {
  snippet: Snippet;
  permissions: SnippetPermissions;
}) {
  return (
    <div className="flex items-center gap-2">
      {permissions.canFavorite ? (
        <FavoriteButton snippetId={snippet.id} favorite={snippet.favorite} />
      ) : null}
      {permissions.canEdit ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/snippets/${snippet.id}/edit`}>
            <Pencil />
            Edit
          </Link>
        </Button>
      ) : null}
      <SnippetMenu snippet={snippet} permissions={permissions} />
    </div>
  );
}
