import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { todoItem as todoItemTable } from "@/lib/db/schema/todo.schema";
import { authedProcedure } from "../base";

export const listTodos = authedProcedure.handler(async ({ context }) => {
  const todos = await db.query.todoItem.findMany({
    where: eq(todoItemTable.userId, context.user.id),
    orderBy: [todoItemTable.createdAt],
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
      .insert(todoItemTable)
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
      categoryId: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { id, ...updates } = input;
    const [updatedTodo] = await db
      .update(todoItemTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(todoItemTable.id, id))
      .returning();
    return updatedTodo;
  });

export const deleteTodo = authedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await db.delete(todoItemTable).where(eq(todoItemTable.id, input.id));
    return { success: true };
  });
