# OAuth Providers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace email/password auth with Google + Apple OAuth sign-in across web, iOS, and Android.

**Architecture:** BetterAuth social provider plugins on the server, `@better-auth/expo` client plugin for native OAuth flows with deep linking. Single auth screen with two OAuth buttons replaces the sign-in/sign-up form screens.

**Tech Stack:** BetterAuth social providers, `@better-auth/expo`, `expo-auth-session`, `expo-web-browser`, `expo-secure-store`

---

### Task 1: Install Server Dependencies

**Files:**
- Modify: `apps/server/package.json`

**Step 1: Install `@better-auth/expo` on the server**

```bash
cd apps/server && bun add @better-auth/expo
```

**Step 2: Verify installation**

```bash
cd apps/server && bun run build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add apps/server/package.json apps/server/bun.lock
git commit -m "chore: add @better-auth/expo server dependency"
```

---

### Task 2: Configure Server Auth — Social Providers + Expo Plugin

**Files:**
- Modify: `apps/server/src/auth.ts:1-27`

**Step 1: Replace auth config**

Replace the entire contents of `apps/server/src/auth.ts` with:

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [expo()],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID as string,
      clientSecret: process.env.APPLE_CLIENT_SECRET as string,
      appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
    },
  },
  trustedOrigins: [
    "http://localhost:8081",
    "http://localhost:19006",
    "https://session-notes-web.netlify.app",
    "https://appleid.apple.com",
    "mobile://",
    ...(process.env.NODE_ENV === "development"
      ? ["exp://", "exp://**"]
      : []),
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
});
```

Key changes:
- Removed `emailAndPassword: { enabled: true }`
- Added `plugins: [expo()]`
- Added `socialProviders` with Google + Apple
- Added `"https://appleid.apple.com"`, `"mobile://"`, and dev Expo origins to `trustedOrigins`

**Step 2: Typecheck**

```bash
cd apps/server && bunx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add apps/server/src/auth.ts
git commit -m "feat: replace email/password with Google + Apple OAuth providers"
```

---

### Task 3: Install Mobile Dependencies

**Files:**
- Modify: `apps/mobile/package.json`

**Step 1: Install client deps**

```bash
cd apps/mobile && bunx expo install expo-auth-session expo-web-browser expo-crypto expo-secure-store @better-auth/expo
```

Note: Use `bunx expo install` (not `bun add`) for Expo-managed packages to get compatible versions.

**Step 2: Verify installation**

```bash
cd apps/mobile && bunx tsc --noEmit
```

Expected: No new type errors.

**Step 3: Commit**

```bash
git add apps/mobile/package.json bun.lock
git commit -m "chore: add OAuth and expo auth dependencies"
```

---

### Task 4: Create Metro Config for Package Exports

**Files:**
- Create: `apps/mobile/metro.config.js`

**Step 1: Create metro config**

Create `apps/mobile/metro.config.js` with:

```js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
```

This is required by `@better-auth/expo` to resolve package exports correctly.

**Step 2: Verify the app still starts**

```bash
cd apps/mobile && bunx expo start --web
```

Expected: App starts without errors. Stop the dev server after verifying.

**Step 3: Commit**

```bash
git add apps/mobile/metro.config.js
git commit -m "chore: add metro config with package exports for better-auth"
```

---

### Task 5: Update Auth Client with Expo Plugin

**Files:**
- Modify: `apps/mobile/lib/auth-client.ts:1-5`

**Step 1: Update auth client**

Replace the entire contents of `apps/mobile/lib/auth-client.ts` with:

```ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  plugins: [
    expoClient({
      scheme: "mobile",
      storagePrefix: "session-notes",
      storage: SecureStore,
    }),
  ],
});
```

Key changes:
- Added `expoClient` plugin with app scheme `"mobile"` (matches `app.json`)
- Added `SecureStore` for secure session caching on native

**Step 2: Typecheck**

```bash
cd apps/mobile && bunx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add apps/mobile/lib/auth-client.ts
git commit -m "feat: add expo client plugin with secure storage to auth client"
```

---

### Task 6: Replace Sign-In Screen with OAuth Buttons

**Files:**
- Modify: `apps/mobile/app/(auth)/sign-in.tsx:1-48`

**Step 1: Replace sign-in screen**

Replace the entire contents of `apps/mobile/app/(auth)/sign-in.tsx` with:

```tsx
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import { authClient } from "../../lib/auth-client";

export default function SignIn() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setLoading(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/(app)/(tabs)",
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || `Sign in with ${provider} failed`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Notes</Text>
      <Text style={styles.subtitle}>Sign in to get started</Text>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={() => handleOAuthSignIn("google")}
        disabled={loading !== null}
      >
        <Text style={styles.googleButtonText}>
          {loading === "google" ? "Signing in..." : "Sign in with Google"}
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" || Platform.OS === "web" ? (
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={() => handleOAuthSignIn("apple")}
          disabled={loading !== null}
        >
          <Text style={styles.appleButtonText}>
            {loading === "apple" ? "Signing in..." : "Sign in with Apple"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 40 },
  button: { padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  googleButton: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
  googleButtonText: { color: "#333", fontSize: 16, fontWeight: "600" },
  appleButton: { backgroundColor: "#000" },
  appleButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
```

Key changes:
- Removed email/password form inputs
- Two OAuth buttons: Google (always shown) and Apple (iOS + web only, since Apple Sign In isn't available on Android)
- Uses `authClient.signIn.social()` — BetterAuth + expo plugin handles the redirect/deep-link flow automatically
- Loading state tracks which provider is active

**Step 2: Typecheck**

```bash
cd apps/mobile && bunx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add apps/mobile/app/\(auth\)/sign-in.tsx
git commit -m "feat: replace email/password form with Google + Apple OAuth buttons"
```

---

### Task 7: Delete Sign-Up Screen

**Files:**
- Delete: `apps/mobile/app/(auth)/sign-up.tsx`

**Step 1: Delete the sign-up screen**

```bash
rm apps/mobile/app/\(auth\)/sign-up.tsx
```

OAuth handles both registration and login in a single flow — no separate sign-up needed.

**Step 2: Verify no references remain**

Search the codebase for any references to `sign-up`:

```bash
grep -r "sign-up" apps/mobile/app/ apps/mobile/lib/ apps/mobile/contexts/ || echo "No references found"
```

Expected: No references found (the Link to sign-up was in the old sign-in screen, which was replaced in Task 6).

**Step 3: Typecheck**

```bash
cd apps/mobile && bunx tsc --noEmit
```

Expected: No errors.

**Step 4: Commit**

```bash
git add -A apps/mobile/app/\(auth\)/sign-up.tsx
git commit -m "feat: remove sign-up screen (OAuth handles registration)"
```

---

### Task 8: Update Environment Variables Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update the Environment Variables section in `CLAUDE.md`**

Find the Environment Variables section and update it to:

```markdown
## Environment Variables

**Mobile** (`apps/mobile/.env`): `EXPO_PUBLIC_API_URL`
**Server** (`apps/server/.env`): `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`, `APPLE_APP_BUNDLE_IDENTIFIER`
```

**Step 2: Update the Auth flow line in Architecture Notes**

Find and update the auth flow description to reflect OAuth instead of email/password:

```markdown
- **Auth flow:** BetterAuth social providers (Google, Apple) via OAuth, sessions via cookies, `credentials: "include"` on fetch
```

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for OAuth auth flow and env vars"
```

---

### Task 9: Manual Smoke Test

This task requires environment variables to be configured. Before testing:

1. **Google:** Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Set redirect URI to `http://localhost:3000/api/auth/callback/google`.
2. **Apple:** Create a Service ID at [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers). Note: Apple Sign In requires HTTPS, so it can only be tested in production or via a tunnel.

**Step 1: Add env vars to `apps/server/.env`**

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-service-id
APPLE_CLIENT_SECRET=your-apple-client-secret
APPLE_APP_BUNDLE_IDENTIFIER=your.bundle.id
```

**Step 2: Start the server**

```bash
cd apps/server && bun run dev
```

**Step 3: Start the mobile app (web)**

```bash
cd apps/mobile && bunx expo start --web
```

**Step 4: Test Google sign-in on web**

- Navigate to the app in browser
- Should see "Sign in with Google" and "Sign in with Apple" buttons
- Click "Sign in with Google"
- Should redirect to Google OAuth consent screen
- After signing in, should redirect back and land on the tabs screen

**Step 5: Test on iOS simulator (if available)**

```bash
cd apps/mobile && bunx expo start --ios
```

- Should see OAuth buttons
- Tap "Sign in with Google" — should open in-app browser for OAuth
- After auth, should deep-link back to app via `mobile://` scheme
