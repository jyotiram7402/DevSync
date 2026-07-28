import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, FlatList, Pressable, TextInput, View } from "react-native";

import type { SearchResult } from "@/features/search/types";
import { Badge, EmptyState, Screen, Spinner, ThemedText } from "~/components/ui";
import { useSearch } from "~/hooks/use-search";
import { useTheme } from "~/providers/theme-provider";

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { term, setTerm, results, loading, hasQuery } = useSearch();

  function openResult(result: SearchResult) {
    if (result.type === "snippet") {
      router.push({ pathname: "/item/[id]", params: { id: result.id } });
    } else {
      Alert.alert(result.title, "Open this on the DevSync web app or extension.");
    }
  }

  return (
    <Screen>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing(2),
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing(3),
        }}
      >
        <Ionicons name="search-outline" size={18} color={theme.colors.mutedText} />
        <TextInput
          value={term}
          onChangeText={setTerm}
          placeholder="Search snippets, projects, collections, tags"
          placeholderTextColor={theme.colors.mutedText}
          autoCapitalize="none"
          accessibilityLabel="Search"
          style={{ flex: 1, color: theme.colors.text, paddingVertical: theme.spacing(3) }}
        />
        {loading ? <Ionicons name="sync-outline" size={16} color={theme.colors.mutedText} /> : null}
      </View>

      {loading && results.length === 0 ? <Spinner label="Searching" /> : null}

      {!loading && hasQuery && results.length === 0 ? (
        <EmptyState title="No results" description={`Nothing matched “${term.trim()}”.`} />
      ) : null}

      {!hasQuery ? (
        <EmptyState title="Search everything" description="Find anything across your workspace." />
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={{ gap: theme.spacing(2) }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openResult(item)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            style={({ pressed }) => ({
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
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText variant="subtitle" numberOfLines={1}>
                {item.title}
              </ThemedText>
              {item.excerpt ? (
                <ThemedText variant="muted" numberOfLines={1}>
                  {item.excerpt}
                </ThemedText>
              ) : null}
            </View>
            <Badge label={item.type} />
          </Pressable>
        )}
      />
    </Screen>
  );
}
