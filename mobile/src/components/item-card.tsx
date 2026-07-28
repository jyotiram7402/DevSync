import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { Badge, ThemedText } from "~/components/ui";
import { useTheme } from "~/providers/theme-provider";
import type { ContentKind, RecentItem } from "~/types";
import { relativeTime } from "~/utils/format";

const ICONS: Record<ContentKind, keyof typeof Ionicons.glyphMap> = {
  text: "document-text-outline",
  url: "link-outline",
  image: "image-outline",
  pdf: "document-outline",
  office: "document-attach-outline",
  archive: "archive-outline",
  audio: "musical-notes-outline",
  video: "videocam-outline",
  file: "document-outline",
};

export function ItemCard({
  item,
  onCopy,
}: {
  item: RecentItem;
  onCopy?: (item: RecentItem) => void;
}) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/item/[id]", params: { id: item.id } })}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing(3),
        flexDirection: "row",
        gap: theme.spacing(3),
        alignItems: "center",
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <Ionicons name={ICONS[item.kind]} size={22} color={theme.colors.mutedText} />
      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText variant="subtitle" numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText variant="muted" numberOfLines={1}>
          {item.preview}
        </ThemedText>
        <View style={{ flexDirection: "row", gap: theme.spacing(2), alignItems: "center" }}>
          {item.language ? <Badge label={item.language} /> : null}
          <ThemedText variant="label">{relativeTime(item.updatedAt)}</ThemedText>
          {item.pinned ? <Badge label="Pinned" tone="brand" /> : null}
        </View>
      </View>
      {onCopy ? (
        <Pressable
          onPress={() => onCopy(item)}
          accessibilityRole="button"
          accessibilityLabel={`Copy ${item.title}`}
          hitSlop={8}
          style={{ padding: theme.spacing(2) }}
        >
          <Ionicons name="copy-outline" size={20} color={theme.colors.mutedText} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
