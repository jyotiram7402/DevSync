/// <reference types="expo/types" />

// Ambient module env types for EXPO_PUBLIC_* variables (read via process.env).
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    EXPO_PUBLIC_DEVSYNC_URL: string;
  }
}
