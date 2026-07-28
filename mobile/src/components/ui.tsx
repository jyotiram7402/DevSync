import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "~/providers/theme-provider";

export function Screen({
  children,
  scroll = false,
  refreshControl,
}: {
  children: ReactNode;
  scroll?: boolean;
  refreshControl?: React.ComponentProps<typeof ScrollView>["refreshControl"];
}) {
  const theme = useTheme();
  const style: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };
  if (scroll) {
    return (
      <SafeAreaView style={style} edges={["top"]}>
        <ScrollView
          contentContainerStyle={{ padding: theme.spacing(4), gap: theme.spacing(4) }}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={style} edges={["top"]}>
      <View style={{ flex: 1, padding: theme.spacing(4), gap: theme.spacing(4) }}>{children}</View>
    </SafeAreaView>
  );
}

type TextVariant = "title" | "subtitle" | "body" | "muted" | "label";

export function ThemedText({
  variant = "body",
  children,
  style,
  numberOfLines,
}: {
  variant?: TextVariant;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const theme = useTheme();
  const styles: Record<TextVariant, TextStyle> = {
    title: { fontSize: 22, fontWeight: "700", color: theme.colors.text },
    subtitle: { fontSize: 16, fontWeight: "600", color: theme.colors.text },
    body: { fontSize: 14, color: theme.colors.text },
    muted: { fontSize: 13, color: theme.colors.mutedText },
    label: { fontSize: 12, fontWeight: "600", color: theme.colors.mutedText },
  };
  return (
    <Text style={[styles[variant], style]} numberOfLines={numberOfLines} allowFontScaling>
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          padding: theme.spacing(4),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  accessibilityHint,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const theme = useTheme();
  const bg =
    variant === "primary"
      ? theme.colors.brand
      : variant === "danger"
        ? "transparent"
        : "transparent";
  const border = variant === "outline" ? theme.colors.border : "transparent";
  const color =
    variant === "primary"
      ? theme.colors.brandText
      : variant === "danger"
        ? theme.colors.danger
        : theme.colors.text;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderColor: border,
        borderWidth: variant === "outline" ? 1 : 0,
        borderRadius: theme.radius.md,
        paddingVertical: theme.spacing(3),
        paddingHorizontal: theme.spacing(4),
        alignItems: "center",
        justifyContent: "center",
        opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        minHeight: 44,
      })}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={{ color, fontWeight: "600", fontSize: 15 }}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Badge({ label, tone = "muted" }: { label: string; tone?: "muted" | "brand" | "success" | "warning" }) {
  const theme = useTheme();
  const map = {
    muted: theme.colors.mutedText,
    brand: theme.colors.brand,
    success: theme.colors.success,
    warning: theme.colors.warning,
  };
  return (
    <View
      style={{
        backgroundColor: `${map[tone]}22`,
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.spacing(2),
        paddingVertical: 2,
      }}
    >
      <Text style={{ color: map[tone], fontSize: 11, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={{ padding: theme.spacing(6), alignItems: "center" }} accessibilityRole="progressbar">
      <ActivityIndicator color={theme.colors.brand} accessibilityLabel={label} />
    </View>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", gap: theme.spacing(2), padding: theme.spacing(6) }}>
      <ThemedText variant="subtitle">{title}</ThemedText>
      {description ? (
        <ThemedText variant="muted" style={{ textAlign: "center" }}>
          {description}
        </ThemedText>
      ) : null}
    </View>
  );
}
