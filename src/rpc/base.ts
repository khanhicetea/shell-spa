import { os } from "@orpc/server";
import type { AuthSession } from "@/lib/auth/auth";
import { adminMiddleware, authMiddleware } from "./middlewares";
import type { DB } from "@/lib/db/init";

export const baseProcedure = os.$context<{
  headers: Headers;
  session: AuthSession;
  db: DB;
}>();
export const publicProcedure = baseProcedure;
export const authedProcedure = baseProcedure.use(authMiddleware);
export const adminProcedure = baseProcedure.use(adminMiddleware);
