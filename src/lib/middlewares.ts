import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { getDatabase } from "./db/init";
import { getAuthConfig } from "./auth/init";

export const dbMiddleware = createMiddleware().server(async ({ next, context }) => {
  const db = getDatabase();
  return next({ context: { db } });
});

export const betterAuthMiddleware = createMiddleware()
  .middleware([dbMiddleware])
  .server(async ({ next, context }) => {
    const auth = getAuthConfig(context.db);
    return next({ context: { auth } });
  });

export const tryAuthMiddleware = createMiddleware()
  .middleware([betterAuthMiddleware])
  .server(async ({ next, context, request }) => {
    const session = await context.auth.api.getSession({
      headers: request.headers,
      query: {
        // ensure session is fresh
        // https://www.better-auth.com/docs/concepts/session-management#session-caching
        disableCookieCache: true,
      },
    });
    return next({ context: { session } });
  });

/**
 * Middleware to force authentication on server requests (including server functions), and add the user to the context.
 */
export const authMiddleware = createMiddleware()
  .middleware([tryAuthMiddleware])
  .server(async ({ next, context }) => {
    if (!context.session) {
      setResponseStatus(401);
      throw redirect({ to: "/login" });
    }

    return next({ context: { user: context.session.user } });
  });
