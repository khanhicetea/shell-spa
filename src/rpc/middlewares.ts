import { ORPCError, os } from "@orpc/server";
import type { ServerAuthSession } from "@/lib/auth/init";

export const authMiddleware = os
  .$context<{ session: ServerAuthSession }>()
  .middleware(async ({ context, next }) => {
    if (!context.session) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const result = await next({
      context: {
        user: context.session.user,
      },
    });

    return result;
  });

export const adminMiddleware = authMiddleware.concat(async ({ context, next }) => {
  if (context.user.role !== "admin") {
    throw new ORPCError("UNAUTHORIZED");
  }

  const result = await next();

  return result;
});
