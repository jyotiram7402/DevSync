import { useShareIntent } from "expo-share-intent";
import { useMemo } from "react";

import type { PendingUpload } from "~/types";
import { fileNameFromUri } from "~/utils/file";
import { kindFromMime, looksLikeUrl } from "~/utils/mime";

interface ShareFile {
  path: string;
  mimeType?: string | null;
  fileName?: string | null;
  size?: number | null;
}

/**
 * Maps an incoming Android share intent (text / link / files) into
 * PendingUpload items for the shared upload engine. The Share Target is
 * declared in app.json (expo-share-intent plugin).
 */
export function useShareHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent({
    resetOnBackground: true,
  });

  const items = useMemo<PendingUpload[]>(() => {
    if (!hasShareIntent) return [];
    const uploads: PendingUpload[] = [];

    const url = shareIntent.webUrl ?? null;
    if (url) {
      uploads.push({
        uri: null,
        text: url,
        name: url,
        mimeType: "text/uri-list",
        size: url.length,
        kind: "url",
      });
    } else if (shareIntent.text) {
      const text = shareIntent.text;
      const isUrl = looksLikeUrl(text);
      uploads.push({
        uri: null,
        text,
        name: isUrl ? text : "Shared text",
        mimeType: isUrl ? "text/uri-list" : "text/plain",
        size: text.length,
        kind: isUrl ? "url" : "text",
      });
    }

    for (const file of (shareIntent.files ?? []) as ShareFile[]) {
      const mimeType = file.mimeType ?? "application/octet-stream";
      uploads.push({
        uri: file.path,
        text: null,
        name: file.fileName ?? fileNameFromUri(file.path),
        mimeType,
        size: file.size ?? 0,
        kind: kindFromMime(mimeType),
      });
    }

    return uploads;
  }, [hasShareIntent, shareIntent]);

  return { items, hasShareIntent, reset: resetShareIntent, error };
}
