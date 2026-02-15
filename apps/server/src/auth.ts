import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "./db";
import { user as userTable } from "./db/schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [expo()],
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          if (account.providerId === "google" || account.providerId === "apple") {
            if (account.idToken) {
              try {
                const payload = JSON.parse(atob(account.idToken.split(".")[1]));
                if (payload.picture) {
                  await db
                    .update(userTable)
                    .set({ image: payload.picture })
                    .where(eq(userTable.id, account.userId));
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        },
      },
    },
  },
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
    "https://app.session-sync.com/",
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
