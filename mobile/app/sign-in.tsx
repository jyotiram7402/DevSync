import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, TextInput, View } from "react-native";
import { z } from "zod";

import { Button, Screen, ThemedText } from "~/components/ui";
import { useAuth } from "~/providers/auth-provider";
import { useTheme } from "~/providers/theme-provider";
import {
  signInWithMagicLink,
  signInWithOAuth,
  signInWithPassword,
} from "~/services/auth-service";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});
type FormValues = z.infer<typeof schema>;

export default function SignInScreen() {
  const theme = useTheme();
  const { session, initializing } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);

  const { control, handleSubmit, getValues, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  if (!initializing && session) return <Redirect href="/" />;

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label);
    try {
      await action();
    } catch (error) {
      Alert.alert("Sign in failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const onPassword = handleSubmit((values) =>
    run("password", () => signInWithPassword(values.email.trim(), values.password)),
  );

  const inputStyle = {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing(3),
    color: theme.colors.text,
    minHeight: 44,
  };

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing(2), marginTop: theme.spacing(8) }}>
        <ThemedText variant="title">
          Dev<ThemedText variant="title" style={{ color: theme.colors.brand }}>Sync</ThemedText>
        </ThemedText>
        <ThemedText variant="muted">Copy once. Debug anywhere. Sign in to sync.</ThemedText>
      </View>

      <View style={{ gap: theme.spacing(3), marginTop: theme.spacing(4) }}>
        <View style={{ gap: theme.spacing(1) }}>
          <ThemedText variant="label">Email</ThemedText>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.mutedText}
                accessibilityLabel="Email"
                style={inputStyle}
              />
            )}
          />
          {formState.errors.email ? (
            <ThemedText variant="muted" style={{ color: theme.colors.danger }}>
              {formState.errors.email.message}
            </ThemedText>
          ) : null}
        </View>

        <View style={{ gap: theme.spacing(1) }}>
          <ThemedText variant="label">Password</ThemedText>
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                autoComplete="current-password"
                placeholder="••••••••"
                placeholderTextColor={theme.colors.mutedText}
                accessibilityLabel="Password"
                style={inputStyle}
              />
            )}
          />
          {formState.errors.password ? (
            <ThemedText variant="muted" style={{ color: theme.colors.danger }}>
              {formState.errors.password.message}
            </ThemedText>
          ) : null}
        </View>

        <Button title="Sign in" onPress={onPassword} loading={busy === "password"} />
        <Button
          title="Email me a magic link"
          variant="outline"
          loading={busy === "magic"}
          onPress={() =>
            run("magic", async () => {
              await signInWithMagicLink(getValues("email").trim());
              Alert.alert("Check your email", "We sent you a sign-in link.");
            })
          }
        />

        <View style={{ gap: theme.spacing(2), marginTop: theme.spacing(2) }}>
          <Button
            title="Continue with Google"
            variant="outline"
            loading={busy === "google"}
            onPress={() => run("google", () => signInWithOAuth("google"))}
          />
          <Button
            title="Continue with GitHub"
            variant="outline"
            loading={busy === "github"}
            onPress={() => run("github", () => signInWithOAuth("github"))}
          />
        </View>
      </View>
    </Screen>
  );
}
