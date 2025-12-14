import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema/auth.schema";
import { authedProcedure } from "../base";

export const listUsers = authedProcedure
  .input(
    z.object({
      page: z.number().int().positive().catch(1),
    }),
  )
  .handler(async ({ input }) => {
    const { page } = input;
    const limit = 10;
    const offset = (page - 1) * limit;

    const [users, totalCountResult] = await Promise.all([
      db.query.user.findMany({
        limit,
        offset,
        orderBy: [desc(userTable.createdAt)],
      }),
      db.select({ count: count() }).from(userTable),
    ]);

    return {
      users,
      pageSize: limit,
      totalCount: totalCountResult[0]?.count ?? 0,
      pageCount: Math.ceil((totalCountResult[0]?.count ?? 0) / limit),
    };
  });

export const getUserById = authedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const foundUser = await db.query.user.findFirst({
      where: eq(userTable.id, input.id),
    });
    return foundUser;
  });
