import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { getServerSession } from "@/lib/auth/auth";

export const tryAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await getServerSession();
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
