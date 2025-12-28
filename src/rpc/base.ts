import { os } from "@orpc/server";
import { adminMiddleware, authMiddleware } from "./middlewares";
import type { DB } from "@/lib/db/init";
import type { ServerAuthSession, ServerAuth } from "@/lib/auth/init";
import type { Repositories } from "@/lib/db/repositories";

export const baseProcedure = os.$context<{
  headers: Headers;
  session: ServerAuthSession;
  db: DB;
  auth: ServerAuth;
  repos: Repositories;
}>();
export const publicProcedure = baseProcedure;
export const authedProcedure = baseProcedure.use(authMiddleware);
export const adminProcedure = baseProcedure.use(adminMiddleware);
