import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { category as categoryTable } from "@/lib/db/schema/todo.schema";
import { authedProcedure } from "../base";

export const listCategories = authedProcedure.handler(async ({ context }) => {
  const categories = await db.query.category.findMany({
    where: eq(categoryTable.userId, context.user.id),
    orderBy: [categoryTable.createdAt],
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
    const [newCategory] = await db
      .insert(categoryTable)
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
  .handler(async ({ input }) => {
    const { id, ...updates } = input;
    const [updatedCategory] = await db
      .update(categoryTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(categoryTable.id, id))
      .returning();
    return updatedCategory;
  });

export const deleteCategory = authedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await db.delete(categoryTable).where(eq(categoryTable.id, input.id));
    return { success: true };
  });
