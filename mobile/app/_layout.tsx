import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AppProviders } from "~/providers";
import { useAuth } from "~/providers/auth-provider";
import { useShareHandler } from "~/hooks/use-share-handler";
import { createSessionFromUrl } from "~/services/auth-service";

/** Routes an incoming share intent to the dedicated handler once signed in. */
function ShareBridge() {
  const { hasShareIntent } = useShareHandler();
  const { session } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (hasShareIntent && session) router.push("/share");
  }, [hasShareIntent, session, router]);
  return null;
}

/** Completes OAuth / magic-link sign-in from a cold-start deep link. */
function DeepLinkBridge() {
  const url = Linking.useURL();
  useEffect(() => {
    if (url && (url.includes("code=") || url.includes("access_token="))) {
      void createSessionFromUrl(url).catch(() => {});
    }
  }, [url]);
  return null;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <ShareBridge />
      <DeepLinkBridge />
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="share" options={{ presentation: "modal" }} />
        <Stack.Screen name="upload" options={{ presentation: "modal" }} />
        <Stack.Screen name="item/[id]" options={{ headerShown: true, title: "Item" }} />
      </Stack>
    </AppProviders>
  );
}
