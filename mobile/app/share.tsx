import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, View } from "react-native";

import { Button, Card, EmptyState, Screen, ThemedText } from "~/components/ui";
import { useWorkspace } from "~/hooks/use-home-data";
import { useConnection } from "~/hooks/use-connection";
import { useShareHandler } from "~/hooks/use-share-handler";
import { useTheme } from "~/providers/theme-provider";
import { submitUpload } from "~/services/sync-manager";
import { formatBytes, truncate } from "~/utils/format";

/**
 * Share Target handler — receives content shared from other apps and uploads it
 * to the active workspace, immediately syncing to every connected client via
 * the existing realtime infrastructure.
 */
export default function ShareScreen() {
  const theme = useTheme();
  const router = useRouter();
  const workspace = useWorkspace();
  const workspaceId = workspace.data?.id ?? null;
  const { online } = useConnection();
  const { items, reset } = useShareHandler();
  const [busy, setBusy] = useState(false);

  async function sync() {
    if (!workspaceId || items.length === 0) return;
    setBusy(true);
    let queued = 0;
    let failed = 0;
    for (const item of items) {
      try {
        const result = await submitUpload(workspaceId, item, online);
        if (result.queued) queued += 1;
      } catch {
        failed += 1;
      }
    }
    setBusy(false);
    reset();
    Alert.alert(
      "Shared to DevSync",
      failed > 0
        ? `${items.length - failed} synced, ${failed} failed.`
        : queued > 0
          ? "Saved — will sync when you reconnect."
          : "Synced to all your devices.",
    );
    router.replace("/");
  }

  return (
    <Screen>
      <ThemedText variant="title">Share to DevSync</ThemedText>

      {items.length === 0 ? (
        <EmptyState title="Nothing to share" description="No shared content was received." />
      ) : (
        <>
          <ThemedText variant="muted">
            {items.length} {items.length === 1 ? "item" : "items"} → {workspace.data?.name ?? "Personal"}
          </ThemedText>
          <FlatList
            data={items}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            contentContainerStyle={{ gap: theme.spacing(2) }}
            renderItem={({ item }) => (
              <Card>
                <ThemedText variant="subtitle" numberOfLines={1}>
                  {item.text ? truncate(item.text, 60) : item.name}
                </ThemedText>
                <ThemedText variant="muted">
                  {item.kind}
                  {item.size > 0 ? ` · ${formatBytes(item.size)}` : ""}
                </ThemedText>
              </Card>
            )}
          />
          <View style={{ gap: theme.spacing(2) }}>
            <Button
              title={busy ? "Syncing…" : `Sync ${items.length} to DevSync`}
              onPress={() => void sync()}
              loading={busy}
            />
            <Button title="Cancel" variant="outline" onPress={() => router.replace("/")} />
          </View>
        </>
      )}
    </Screen>
  );
}
