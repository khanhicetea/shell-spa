import { z } from "zod";
import { authedProcedure } from "../base";

export const listCategories = authedProcedure.handler(async ({ context }) => {
  const { db } = context;
  const categories = await db
    .selectFrom("todoCategory")
    .selectAll()
    .where("userId", "=", context.user.id)
    .orderBy("createdAt")
    .execute();
  return categories;
});

export const createCategory = authedProcedure
  .input(
    z.object({
      name: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const { db } = context;
    const newCategory = await db
      .insertInto("todoCategory")
      .values({
        id: crypto.randomUUID(),
        userId: context.user.id,
        name: input.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return newCategory;
  });

export const updateCategory = authedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const { db } = context;
    const { id, ...updates } = input;
    const updatedCategory = await db
      .updateTable("todoCategory")
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
    return updatedCategory;
  });

export const deleteCategory = authedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { db } = context;
    await db.deleteFrom("todoCategory").where("id", "=", input.id).execute();
    return { success: true };
  });
