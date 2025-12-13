import type { AuthSession } from "@/lib/auth/auth";
import { ORPCError, os } from "@orpc/server";

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
