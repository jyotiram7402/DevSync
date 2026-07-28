import * as Linking from "expo-linking";
import { Pressable, Switch, View } from "react-native";

import { Button, Card, Screen, ThemedText } from "~/components/ui";
import { useWorkspace } from "~/hooks/use-home-data";
import { CLIENT_VERSION } from "~/lib/constants";
import { dashboardUrl } from "~/lib/config";
import { useTheme } from "~/providers/theme-provider";
import { signOut } from "~/services/auth-service";
import { useSettingsStore } from "~/stores/settings-store";
import type { ThemePreference } from "~/types";

const THEMES: ThemePreference[] = ["system", "light", "dark"];

function Row({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.spacing(3),
        paddingVertical: theme.spacing(2),
      }}
    >
      <View style={{ flex: 1 }}>
        <ThemedText variant="body">{label}</ThemedText>
        {description ? <ThemedText variant="muted">{description}</ThemedText> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        trackColor={{ true: theme.colors.brand, false: theme.colors.border }}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const workspace = useWorkspace();
  const { settings, update } = useSettingsStore();

  return (
    <Screen scroll>
      <ThemedText variant="title">Settings</ThemedText>

      <Card>
        <ThemedText variant="label">Theme</ThemedText>
        <View style={{ flexDirection: "row", gap: theme.spacing(2), marginTop: theme.spacing(2) }}>
          {THEMES.map((option) => {
            const active = settings.theme === option;
            return (
              <Pressable
                key={option}
                onPress={() => update({ theme: option })}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Theme ${option}`}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: theme.spacing(2),
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.brand : theme.colors.border,
                  backgroundColor: active ? `${theme.colors.brand}22` : "transparent",
                }}
              >
                <ThemedText variant="body" style={{ textTransform: "capitalize" }}>
                  {option}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <ThemedText variant="label">Workspace</ThemedText>
        <ThemedText variant="body" style={{ marginTop: 4 }}>
          {workspace.data?.name ?? "Personal"}
        </ThemedText>
      </Card>

      <Card>
        <ThemedText variant="label">Sync</ThemedText>
        <Row
          label="Auto paste & sync"
          description="Foreground only. Android restricts background clipboard access."
          value={settings.autoSyncClipboard}
          onValueChange={(value) => update({ autoSyncClipboard: value })}
        />
      </Card>

      <Card>
        <ThemedText variant="label">Uploads</ThemedText>
        <Row
          label="Compress images"
          value={settings.compressImages}
          onValueChange={(value) => update({ compressImages: value })}
        />
        <Row
          label="Wi-Fi only uploads"
          value={settings.wifiOnlyUploads}
          onValueChange={(value) => update({ wifiOnlyUploads: value })}
        />
      </Card>

      <Card>
        <ThemedText variant="label">Privacy</ThemedText>
        <Row
          label="Anonymous analytics"
          description="Scaffold only — nothing is collected yet."
          value={settings.telemetry}
          onValueChange={(value) => update({ telemetry: value })}
        />
      </Card>

      <Card>
        <ThemedText variant="label">Developer</ThemedText>
        <Row
          label="Developer options"
          value={settings.developerMode}
          onValueChange={(value) => update({ developerMode: value })}
        />
      </Card>

      <Card>
        <ThemedText variant="label">About</ThemedText>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <ThemedText variant="body">Version</ThemedText>
          <ThemedText variant="muted">{CLIENT_VERSION}</ThemedText>
        </View>
        <Pressable
          onPress={() => void Linking.openURL(dashboardUrl("/dashboard"))}
          accessibilityRole="link"
          style={{ marginTop: theme.spacing(2) }}
        >
          <ThemedText variant="body" style={{ color: theme.colors.brand }}>
            Open DevSync dashboard
          </ThemedText>
        </Pressable>
      </Card>

      <Button title="Sign out" variant="danger" onPress={() => void signOut()} />
    </Screen>
  );
}
