import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { user as userTable } from "@/lib/db/schema/auth.schema";
import { adminProcedure } from "../base";

export const listUsers = adminProcedure
  .input(
    z.object({
      page: z.number().int().positive().catch(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const { db } = context;
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
      page,
      pageSize: limit,
      totalCount: totalCountResult[0]?.count ?? 0,
      pageCount: Math.ceil((totalCountResult[0]?.count ?? 0) / limit),
    };
  });

export const getUserById = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { db } = context;
    const foundUser = await db.query.user.findFirst({
      where: eq(userTable.id, input.id),
    });
    return foundUser;
  });
