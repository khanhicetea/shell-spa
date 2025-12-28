import { z } from "zod";
import { adminProcedure } from "../base";

export const listUsers = adminProcedure
  .input(
    z.object({
      page: z.number().int().positive().catch(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const { repos, db } = context;
    const { page } = input;
    const limit = 10;
    const offset = (page - 1) * limit;

    const [users, [{ count }]] = await Promise.all([
      db
        .selectFrom("user")
        .selectAll()
        .orderBy("createdAt", "desc")
        .limit(limit)
        .offset(offset)
        .execute(),
      db
        .selectFrom("user")
        .select((eb) => eb.fn.count<number>("id").as("count"))
        .execute(),
    ]);

    return {
      users,
      page,
      pageSize: limit,
      totalCount: Number(count) ?? 0,
      pageCount: Math.ceil((Number(count) ?? 0) / limit),
    };
  });

export const getUserById = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { repos } = context;
    return (await repos.user.findById(input.id)) ?? null;
  });
