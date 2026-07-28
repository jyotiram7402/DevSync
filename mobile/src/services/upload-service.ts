import {
  insertSnippetRow,
  updateSnippetRow,
} from "@/features/snippets/services/snippet-repository";
import { snippetAttachmentPath } from "@/lib/storage/paths";
import { uploadFile } from "@/lib/storage/storage";
import { markLocalWrite } from "@/lib/sync/local-echo";
import type { TablesInsert } from "@/types/database";
import { supabase } from "~/lib/supabase";
import type { PendingUpload } from "~/types";
import { blobFromUri } from "~/utils/file";
import { languageFromName, looksLikeUrl } from "~/utils/mime";

/**
 * Upload engine — the core "everything syncs" flow. It REUSES the shared
 * snippet-repository (create/update) and storage service (validate + upload),
 * and the shared `markLocalWrite` for self-echo filtering. Text/URLs become
 * snippet rows; files become a snippet row plus a `snippet-attachments` object
 * referenced from the snippet's `metadata`. No backend logic is duplicated.
 */
async function currentUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  return user.id;
}

async function createTextSnippet(
  workspaceId: string,
  userId: string,
  item: PendingUpload,
): Promise<string> {
  const text = item.text ?? "";
  const isUrl = item.kind === "url" || looksLikeUrl(text);
  const language = isUrl ? null : languageFromName(item.name);
  const values: TablesInsert<"snippets"> = {
    workspace_id: workspaceId,
    content: text,
    title: null,
    language,
    type: language ? "code" : "text",
    tags: [],
    visibility: "private",
    created_by: userId,
    updated_by: userId,
    metadata: { kind: isUrl ? "url" : "text", source: "mobile" },
  };
  const row = await insertSnippetRow(supabase, values);
  markLocalWrite(row.id);
  return row.id;
}

export async function uploadPending(workspaceId: string, item: PendingUpload): Promise<string> {
  const userId = await currentUserId();

  if (item.text !== null) {
    return createTextSnippet(workspaceId, userId, item);
  }

  const baseValues: TablesInsert<"snippets"> = {
    workspace_id: workspaceId,
    content: item.name,
    title: item.name,
    language: null,
    type: "file",
    tags: [],
    visibility: "private",
    created_by: userId,
    updated_by: userId,
    metadata: {
      kind: item.kind,
      mimeType: item.mimeType,
      size: item.size,
      status: "uploading",
      source: "mobile",
    },
  };
  const row = await insertSnippetRow(supabase, baseValues);
  markLocalWrite(row.id);

  if (item.uri) {
    const blob = await blobFromUri(item.uri);
    const path = snippetAttachmentPath(workspaceId, row.id, item.name);
    const result = await uploadFile(supabase, {
      bucket: "snippet-attachments",
      path,
      file: blob,
      contentType: item.mimeType,
    });

    if (!result.ok) {
      await updateSnippetRow(supabase, workspaceId, row.id, {
        metadata: {
          kind: item.kind,
          mimeType: item.mimeType,
          size: item.size,
          status: "failed",
          source: "mobile",
        },
      });
      throw new Error(result.error.message);
    }

    await updateSnippetRow(supabase, workspaceId, row.id, {
      metadata: {
        kind: item.kind,
        mimeType: item.mimeType,
        size: item.size,
        bucket: "snippet-attachments",
        path: result.data.path,
        status: "synced",
        source: "mobile",
      },
    });
  }

  return row.id;
}
