import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, RefreshControl, View } from "react-native";

import { ItemCard } from "~/components/item-card";
import {
  ConnectionPill,
  QuickActions,
  SectionHeader,
  StorageUsageCard,
  SyncPill,
  WorkspaceBadge,
} from "~/components/home-widgets";
import { EmptyState, Screen, Spinner } from "~/components/ui";
import { useHomeData } from "~/hooks/use-home-data";
import { useTheme } from "~/providers/theme-provider";
import { getClipboardText, setClipboardText } from "~/services/clipboard-service";
import { getSnippet } from "~/services/snippet-service";
import { submitUpload } from "~/services/sync-manager";
import { useQueueStore } from "~/stores/queue-store";
import type { PendingUpload, RecentItem } from "~/types";
import { looksLikeUrl } from "~/utils/mime";

type ActionTile = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { workspace, workspaceId, recent, favorites, pinned, online, refetchAll, loading } =
    useHomeData();
  const pending = useQueueStore((state) => state.items.length);

  const onCopy = useCallback(
    async (item: RecentItem) => {
      if (!workspaceId) return;
      const snippet = await getSnippet(workspaceId, item.id);
      if (snippet?.content) {
        await setClipboardText(snippet.content);
        Alert.alert("Copied", "Snippet copied to your clipboard.");
      }
    },
    [workspaceId],
  );

  const onPaste = useCallback(async () => {
    if (!workspaceId) return;
    const text = await getClipboardText();
    if (!text) {
      Alert.alert("Clipboard empty", "Copy something first, then paste & sync.");
      return;
    }
    const isUrl = looksLikeUrl(text);
    const item: PendingUpload = {
      uri: null,
      text,
      name: isUrl ? text : "Clipboard",
      mimeType: isUrl ? "text/uri-list" : "text/plain",
      size: text.length,
      kind: isUrl ? "url" : "text",
    };
    try {
      const result = await submitUpload(workspaceId, item, online);
      refetchAll();
      Alert.alert(
        result.queued ? "Queued" : "Synced",
        result.queued ? "Saved offline — will sync when you reconnect." : "Saved to DevSync.",
      );
    } catch (error) {
      Alert.alert("Sync failed", error instanceof Error ? error.message : "Please try again.");
    }
  }, [workspaceId, online, refetchAll]);

  const actions: ActionTile[] = [
    { key: "paste", label: "Paste & Sync", icon: "clipboard-outline", onPress: () => void onPaste() },
    { key: "upload", label: "Add files", icon: "cloud-upload-outline", onPress: () => router.push("/upload") },
    { key: "search", label: "Search", icon: "search-outline", onPress: () => router.push("/search") },
    { key: "devices", label: "Devices", icon: "phone-portrait-outline", onPress: () => router.push("/devices") },
  ];

  const sections: Array<[string, RecentItem[]]> = [
    ["Pinned", pinned.data ?? []],
    ["Favorites", favorites.data ?? []],
    ["Recent", recent.data ?? []],
  ];

  const isEmpty = !loading && (recent.data ?? []).length === 0;

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={recent.isFetching}
          onRefresh={refetchAll}
          tintColor={theme.colors.brand}
        />
      }
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <WorkspaceBadge name={workspace?.name ?? "Personal"} />
        <View style={{ flexDirection: "row", gap: theme.spacing(2) }}>
          <ConnectionPill online={online} />
          <SyncPill pending={pending} />
        </View>
      </View>

      <QuickActions actions={actions} />
      <StorageUsageCard itemCount={(recent.data ?? []).length} />

      {loading ? <Spinner /> : null}

      {sections.map(([title, items]) =>
        items.length > 0 ? (
          <View key={title} style={{ gap: theme.spacing(2) }}>
            <SectionHeader title={title} count={items.length} />
            {items.map((item) => (
              <ItemCard key={item.id} item={item} onCopy={onCopy} />
            ))}
          </View>
        ) : null,
      )}

      {isEmpty ? (
        <EmptyState
          title="Nothing synced yet"
          description="Paste, add files, or share to DevSync to get started."
        />
      ) : null}
    </Screen>
  );
}
