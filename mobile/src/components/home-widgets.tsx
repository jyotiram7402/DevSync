import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { Badge, Card, ThemedText } from "~/components/ui";
import { useTheme } from "~/providers/theme-provider";

export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View
      accessibilityRole="header"
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
    >
      <ThemedText variant="subtitle">{title}</ThemedText>
      {typeof count === "number" ? <Badge label={String(count)} /> : null}
    </View>
  );
}

export function ConnectionPill({ online }: { online: boolean }) {
  return <Badge label={online ? "Online" : "Offline"} tone={online ? "success" : "warning"} />;
}

export function SyncPill({ pending }: { pending: number }) {
  if (pending > 0) return <Badge label={`${pending} queued`} tone="warning" />;
  return <Badge label="Synced" tone="success" />;
}

export function WorkspaceBadge({ name }: { name: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing(1.5) }}>
      <View
        style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.brand }}
        accessibilityElementsHidden
      />
      <ThemedText variant="label">{name}</ThemedText>
    </View>
  );
}

interface Action {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function QuickActions({ actions }: { actions: Action[] }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing(2) }}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => ({
            flexGrow: 1,
            flexBasis: "47%",
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing(2),
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: theme.radius.md,
            padding: theme.spacing(3),
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Ionicons name={action.icon} size={20} color={theme.colors.brand} />
          <ThemedText variant="body">{action.label}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

export function StorageUsageCard({ itemCount }: { itemCount: number }) {
  return (
    <Card>
      <ThemedText variant="label">Workspace</ThemedText>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
        <ThemedText variant="body">Synced items</ThemedText>
        <ThemedText variant="subtitle">{itemCount}</ThemedText>
      </View>
    </Card>
  );
}
