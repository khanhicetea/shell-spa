import { createServerOnlyFn } from "@tanstack/react-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { ac, admin as adminRole, user as userRole } from "./permissions";
import { DB } from "@/lib/db/init";

export const getAuthConfig = createServerOnlyFn((db: DB) =>
  betterAuth({
    // baseURL: env.VITE_BASE_URL,
    telemetry: {
      enabled: false,
    },
    database: drizzleAdapter(db, {
      provider: "pg",
    }),

    // https://www.better-auth.com/docs/integrations/tanstack#usage-tips
    plugins: [
      tanstackStartCookies(),
      admin({
        ac,
        roles: {
          admin: adminRole,
          user: userRole,
        },
      }),
    ],

    // https://www.better-auth.com/docs/concepts/session-management#session-caching
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },

    // https://www.better-auth.com/docs/concepts/oauth
    socialProviders: {},

    // https://www.better-auth.com/docs/authentication/email-password
    emailAndPassword: {
      enabled: true,
    },

    experimental: {
      // https://www.better-auth.com/docs/adapters/drizzle#joins-experimental
      joins: true,
    },
  }),
);
