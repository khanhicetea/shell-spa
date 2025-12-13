import type { AuthSession } from "@/lib/auth/auth";
import { os } from "@orpc/server";
import { authMiddleware } from "./middlewares";

export const baseProcedure = os.$context<{
  headers: Headers;
  session: AuthSession;
}>();
export const publicProcedure = baseProcedure;
export const authedProcedure = baseProcedure.use(authMiddleware);
