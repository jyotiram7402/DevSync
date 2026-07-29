import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Alert, View } from "react-native";

import { Button, Card, EmptyState, Screen, Spinner, ThemedText } from "~/components/ui";
import { useWorkspace } from "~/hooks/use-home-data";
import { useTheme } from "~/providers/theme-provider";
import { setClipboardText } from "~/services/clipboard-service";
import { getSnippet } from "~/services/snippet-service";

export default function ItemScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workspace = useWorkspace();
  const workspaceId = workspace.data?.id ?? null;

  const query = useQuery({
    queryKey: ["snippet", workspaceId, id],
    queryFn: () => (workspaceId && id ? getSnippet(workspaceId, id) : Promise.resolve(null)),
    enabled: Boolean(workspaceId && id),
  });

  if (query.isLoading) {
    return (
      <Screen>
        <Spinner />
      </Screen>
    );
  }

  const snippet = query.data;
  if (!snippet) {
    return (
      <Screen>
        <EmptyState title="Not found" description="This item is unavailable." />
      </Screen>
    );
  }

  const metadata = snippet.metadata;
  const kind =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>).kind
      : undefined;
  const isFile = typeof kind === "string" && kind !== "text" && kind !== "url";

  return (
    <Screen scroll>
      <ThemedText variant="title">
        {snippet.title && snippet.title.length > 0 ? snippet.title : "Untitled"}
      </ThemedText>

      <View style={{ flexDirection: "row", gap: theme.spacing(2) }}>
        {snippet.language ? <ThemedText variant="label">{snippet.language}</ThemedText> : null}
        <ThemedText variant="label">{snippet.visibility}</ThemedText>
      </View>

      {isFile ? (
        <Card>
          <ThemedText variant="body">{snippet.content}</ThemedText>
          <ThemedText variant="muted" style={{ marginTop: 6 }}>
            Attachment stored in your workspace. Open it on the DevSync web app to preview or
            download.
          </ThemedText>
        </Card>
      ) : (
        <Card>
          <ThemedText variant="body" style={{ fontFamily: "monospace" }}>
            {snippet.content}
          </ThemedText>
        </Card>
      )}

      {!isFile ? (
        <Button
          title="Copy to clipboard"
          onPress={async () => {
            await setClipboardText(snippet.content);
            Alert.alert("Copied", "Copied to your clipboard.");
          }}
        />
      ) : null}
    </Screen>
  );
}
