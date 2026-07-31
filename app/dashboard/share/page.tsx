import { PageHeader } from "@/components/shared/page-header";
import { ShareReceiver } from "@/features/capture/share-receiver";

export const metadata = {
  title: "Share to CopyAnywhere",
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw : "";
}

/**
 * Android share-sheet target (manifest `share_target`). Chrome opens this route
 * with the shared title/text/url as query params; the receiver lets the user
 * review and sync. Also reachable as an app shortcut ("Quick add").
 */
export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  // A shared link may arrive as `url`, or inside `text` depending on the source app.
  const shared = [firstValue(sp.url), firstValue(sp.text)]
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .join("\n\n");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Share to CopyAnywhere"
        description="Review what you shared, then sync it to every device."
      />
      <ShareReceiver shared={shared} />
    </div>
  );
}
