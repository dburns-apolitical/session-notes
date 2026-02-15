# Switch to Google + Apple OAuth

Replace email/password auth with Google and Apple social sign-in via BetterAuth's social provider plugins.

## Motivation

Avoid email verification complexity. OAuth providers handle identity verification.

## Decisions

- **Providers:** Google + Apple (Apple required by App Store policy when offering other social logins)
- **Email/password:** Remove completely
- **Platforms:** Web + iOS + Android
- **Approach:** BetterAuth social provider plugins (minimal changes to existing infrastructure)

## Server Changes

Replace `emailAndPassword: { enabled: true }` with social providers in `apps/server/src/auth.ts`:

```ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  apple: {
    clientId: process.env.APPLE_CLIENT_ID,
    clientSecret: process.env.APPLE_CLIENT_SECRET,
    appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER,
  },
},
trustedOrigins: [
  // existing origins...
  "https://appleid.apple.com",
],
```

**New env vars:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`, `APPLE_APP_BUNDLE_IDENTIFIER`

No DB schema changes — BetterAuth's `account` table already supports multiple providers.

## Mobile Client Changes

### Auth Client

Add `@better-auth/expo` plugin to `apps/mobile/lib/auth-client.ts` for native OAuth redirect handling.

### OAuth Flow Strategy

- **Web:** `authClient.signIn.social({ provider: "google" })` — BetterAuth handles redirect flow
- **Native (iOS/Android):** Use `expo-auth-session` to get an ID token from Google/Apple natively, then pass it to `authClient.signIn.social({ provider: "google", idToken: { token } })` — no redirect, direct sign-in

### UI

Single auth screen replaces sign-in + sign-up:
- "Sign in with Google" button
- "Sign in with Apple" button
- No forms, no text inputs

OAuth handles both registration and login in one flow.

### Auth Context

No changes — `authClient.useSession()` still works, route protection unchanged.

## Dependencies to Add

- `@better-auth/expo` — client plugin for native flows
- `expo-auth-session` — native OAuth token acquisition
- `expo-web-browser` — needed by expo-auth-session
- `expo-crypto` — needed for PKCE code verifier

## Files to Modify

- `apps/server/src/auth.ts` — swap emailAndPassword for socialProviders
- `apps/mobile/lib/auth-client.ts` — add expo plugin
- `apps/mobile/app/(auth)/sign-in.tsx` — replace with OAuth buttons
- `apps/mobile/app/(auth)/sign-up.tsx` — delete (OAuth handles both)
- `apps/mobile/contexts/auth.tsx` — minor: remove sign-up route references if any

## References

- [BetterAuth Google docs](https://www.better-auth.com/docs/authentication/google)
- [BetterAuth Apple docs](https://www.better-auth.com/docs/authentication/apple)
- [BetterAuth Expo integration](https://www.better-auth.com/docs/integrations/expo)
