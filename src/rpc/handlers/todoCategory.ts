import { eq } from "drizzle-orm";
import { z } from "zod";
import { todoCategory as todoCategoryTable } from "@/lib/db/schema/todo.schema";
import { authedProcedure } from "../base";

export const listCategories = authedProcedure.handler(async ({ context }) => {
  const { db } = context;
  const categories = await db.query.todoCategory.findMany({
    where: eq(todoCategoryTable.userId, context.user.id),
    orderBy: [todoCategoryTable.createdAt],
  });
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
    const [newCategory] = await db
      .insert(todoCategoryTable)
      .values({
        id: crypto.randomUUID(),
        userId: context.user.id,
        name: input.name,
      })
      .returning();
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
    const [updatedCategory] = await db
      .update(todoCategoryTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(todoCategoryTable.id, id))
      .returning();
    return updatedCategory;
  });

export const deleteCategory = authedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { db } = context;
    await db.delete(todoCategoryTable).where(eq(todoCategoryTable.id, input.id));
    return { success: true };
  });
