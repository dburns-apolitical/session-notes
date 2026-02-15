import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  plugins:
    Platform.OS !== "web"
      ? [
          expoClient({
            scheme: "mobile",
            storagePrefix: "session-notes",
            storage: SecureStore,
          }),
        ]
      : [],
  fetchOptions: {
    credentials: "include",
  },
});
