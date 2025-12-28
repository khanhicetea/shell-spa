import { z } from "zod";
import { authedProcedure } from "../base";

export const listTodos = authedProcedure.handler(async ({ context }) => {
  const { db } = context;
  const todos = await db
    .selectFrom("todoItem")
    .selectAll()
    .where("userId", "=", context.user.id)
    .orderBy("createdAt")
    .execute();
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
    const { db } = context;
    const newTodo = await db
      .insertInto("todoItem")
      .values({
        id: crypto.randomUUID(),
        userId: context.user.id,
        categoryId: input.categoryId,
        content: input.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
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
  .handler(async ({ input, context }) => {
    const { db } = context;
    const { id, ...updates } = input;
    const updatedTodo = await db
      .updateTable("todoItem")
      .set({
        ...(updates.content !== undefined && { content: updates.content }),
        ...(updates.completedAt !== undefined && {
          completedAt: updates.completedAt,
        }),
        ...(updates.categoryId !== undefined && {
          categoryId: updates.categoryId,
        }),
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
    return updatedTodo;
  });

export const deleteTodo = authedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { db } = context;
    await db.deleteFrom("todoItem").where("id", "=", input.id).execute();
    return { success: true };
  });
