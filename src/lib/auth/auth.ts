import { db } from "@/lib/db";
import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { tanstackStartCookies } from "better-auth/tanstack-start";

const getAuthConfig = createServerOnlyFn(() =>
  betterAuth({
    // baseURL: env.VITE_BASE_URL,
    telemetry: {
      enabled: false,
    },
    database: drizzleAdapter(db, {
      provider: "pg",
    }),

    // https://www.better-auth.com/docs/integrations/tanstack#usage-tips
    plugins: [tanstackStartCookies()],

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

export const auth = getAuthConfig();

export const getServerSession = async () => {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
    query: {
      // ensure session is fresh
      // https://www.better-auth.com/docs/concepts/session-management#session-caching
      disableCookieCache: true,
    },
  });

  return session;
};
export type AuthSession = Awaited<ReturnType<typeof getServerSession>>;
