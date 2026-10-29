"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useSupabase } from "@/hooks/use-supabase";
import { downloadFile } from "@/lib/storage/storage";

/**
 * Downloads a synced or shared file's real bytes through the signed-in
 * client, so it keeps its name and never depends on a link that may have
 * expired.
 */
export function FileDownloadButton({
  path,
  name,
  bucket = "snippet-attachments",
  size = "sm",
  variant = "outline",
}: {
  path: string;
  name: string;
  bucket?: "snippet-attachments" | "space-attachments";
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}) {
  const supabase = useSupabase();
  const [busy, setBusy] = useState(false);

  async function download() {
    if (busy) return;
    setBusy(true);
    const result = await downloadFile(supabase, bucket, path);
    setBusy(false);
    if (!result.ok) {
      toast.error("Couldn't download the file. Check your connection and try again.");
      return;
    }
    const objectUrl = URL.createObjectURL(result.data);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = name.length > 0 ? name : "download";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Give Safari and Firefox time to start the download before the URL goes away.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  }

  return (
    <Button type="button" size={size} variant={variant} onClick={() => void download()} loading={busy}>
      {busy ? null : <Download aria-hidden="true" />}
      Download
      <span className="sr-only"> {name}</span>
    </Button>
  );
}
