import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { todo as todoTable } from "@/lib/db/schema/todo.schema";
import { authedProcedure } from "../base";

export const listTodos = authedProcedure.handler(async ({ context }) => {
  const todos = await db.query.todo.findMany({
    where: eq(todoTable.userId, context.user.id),
    orderBy: [todoTable.createdAt],
  });
  return todos;
});

export const createTodo = authedProcedure
  .input(
    z.object({
      content: z.string().min(1),
      categoryId: z.string(),
    }),
  )
  .handler(async ({ input, context }) => {
    const [newTodo] = await db
      .insert(todoTable)
      .values({
        id: crypto.randomUUID(),
        userId: context.user.id,
        categoryId: input.categoryId,
        content: input.content,
      })
      .returning();
    return newTodo;
  });

export const updateTodo = authedProcedure
  .input(
    z.object({
      id: z.string(),
      content: z.string().min(1).optional(),
      completedAt: z.date().nullable().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { id, ...updates } = input;
    const [updatedTodo] = await db
      .update(todoTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(todoTable.id, id))
      .returning();
    return updatedTodo;
  });

export const deleteTodo = authedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await db.delete(todoTable).where(eq(todoTable.id, input.id));
    return { success: true };
  });
