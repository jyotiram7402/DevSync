import * as SecureStore from "expo-secure-store";

/**
 * Encrypted-at-rest storage adapter for the Supabase auth session (Android
 * Keystore via expo-secure-store). Satisfies the "encrypted local storage where
 * appropriate" requirement — the session token is the only sensitive value we
 * persist, and it never leaves the device unencrypted.
 *
 * NOTE: SecureStore warns above ~2KB; Supabase sessions are typically under it.
 * If a provider issues an unusually large token, switch to a chunked adapter.
 */
export const secureStorageAdapter = {
  getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  setItem(key: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(key);
  },
};
