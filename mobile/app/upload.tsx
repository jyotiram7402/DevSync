import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, View } from "react-native";

import { Button, Card, EmptyState, Screen, ThemedText } from "~/components/ui";
import { QuickActions } from "~/components/home-widgets";
import { useConnection } from "~/hooks/use-connection";
import { useFilePicker } from "~/hooks/use-file-picker";
import { useWorkspace } from "~/hooks/use-home-data";
import { useTheme } from "~/providers/theme-provider";
import { submitUpload } from "~/services/sync-manager";
import type { PendingUpload } from "~/types";
import { formatBytes } from "~/utils/format";

export default function UploadScreen() {
  const theme = useTheme();
  const router = useRouter();
  const workspace = useWorkspace();
  const workspaceId = workspace.data?.id ?? null;
  const { online } = useConnection();
  const { pickImages, takePhoto, pickDocuments } = useFilePicker();
  const [items, setItems] = useState<PendingUpload[]>([]);
  const [busy, setBusy] = useState(false);

  const add = useCallback(async (picker: () => Promise<PendingUpload[]>) => {
    const picked = await picker();
    if (picked.length > 0) setItems((current) => [...current, ...picked]);
  }, []);

  async function upload() {
    if (!workspaceId || items.length === 0) return;
    setBusy(true);
    let failed = 0;
    for (const item of items) {
      try {
        await submitUpload(workspaceId, item, online);
      } catch {
        failed += 1;
      }
    }
    setBusy(false);
    Alert.alert(
      "Upload complete",
      failed > 0 ? `${items.length - failed} uploaded, ${failed} failed.` : "All items synced.",
    );
    router.back();
  }

  return (
    <Screen>
      <ThemedText variant="title">Add content</ThemedText>

      <QuickActions
        actions={[
          { key: "gallery", label: "Gallery", icon: "images-outline", onPress: () => void add(pickImages) },
          { key: "camera", label: "Camera", icon: "camera-outline", onPress: () => void add(takePhoto) },
          { key: "docs", label: "Documents", icon: "document-outline", onPress: () => void add(pickDocuments) },
        ]}
      />

      {items.length === 0 ? (
        <EmptyState title="No files selected" description="Pick from gallery, camera, or documents." />
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            contentContainerStyle={{ gap: theme.spacing(2) }}
            renderItem={({ item, index }) => (
              <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: theme.spacing(2) }}>
                  <ThemedText variant="subtitle" numberOfLines={1} style={{ flex: 1 }}>
                    {item.name}
                  </ThemedText>
                  <Button
                    title="Remove"
                    variant="ghost"
                    onPress={() => setItems((current) => current.filter((_, i) => i !== index))}
                  />
                </View>
                <ThemedText variant="muted">
                  {item.kind}
                  {item.size > 0 ? ` · ${formatBytes(item.size)}` : ""}
                </ThemedText>
              </Card>
            )}
          />
          <Button
            title={busy ? "Uploading…" : `Upload ${items.length}`}
            onPress={() => void upload()}
            loading={busy}
          />
        </>
      )}
    </Screen>
  );
}
