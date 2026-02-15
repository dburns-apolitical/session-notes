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
