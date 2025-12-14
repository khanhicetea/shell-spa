import { ORPCError, os } from "@orpc/server";
import type { AuthSession } from "@/lib/auth/auth";

export const authMiddleware = os
  .$context<{ session: AuthSession }>()
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
