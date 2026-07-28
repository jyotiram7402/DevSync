import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { Badge, Card, ThemedText } from "~/components/ui";
import { useTheme } from "~/providers/theme-provider";
import type { DeviceInfo } from "~/types";
import { relativeTime } from "~/utils/format";

const CLIENT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  mobile: "phone-portrait-outline",
  web: "globe-outline",
  extension: "extension-puzzle-outline",
  vscode: "code-slash-outline",
  cli: "terminal-outline",
};

export function DeviceCard({ device, isCurrent }: { device: DeviceInfo; isCurrent: boolean }) {
  const theme = useTheme();
  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing(3) }}>
        <Ionicons
          name={CLIENT_ICON[device.clientType] ?? "hardware-chip-outline"}
          size={24}
          color={theme.colors.mutedText}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing(2) }}>
            <ThemedText variant="subtitle" numberOfLines={1}>
              {device.name}
            </ThemedText>
            {isCurrent ? <Badge label="This device" tone="brand" /> : null}
          </View>
          <ThemedText variant="muted" numberOfLines={1}>
            {[device.os, device.clientType].filter(Boolean).join(" · ")}
          </ThemedText>
          <ThemedText variant="label">Last sync {relativeTime(device.lastSeenAt) || "unknown"}</ThemedText>
        </View>
        <Badge label={device.online ? "Online" : "Offline"} tone={device.online ? "success" : "muted"} />
      </View>
    </Card>
  );
}
