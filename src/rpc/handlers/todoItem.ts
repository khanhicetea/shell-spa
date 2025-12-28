import { z } from "zod";
import { authedProcedure } from "../base";

export const listTodos = authedProcedure.handler(async ({ context }) => {
  const { repos } = context;
  return repos.todoItem.findByUserId(context.user.id);
});

export const createTodo = authedProcedure
  .input(
    z.object({
      content: z.string().min(1),
      categoryId: z.string(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { repos } = context;
    const newTodo = await repos.todoItem.insertReturn({
      id: crypto.randomUUID(),
      userId: context.user.id,
      categoryId: input.categoryId,
      content: input.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return newTodo ?? null;
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
    const { repos } = context;
    const { id, ...updates } = input;
    const updatedTodo = await repos.todoItem.updateById(id, {
      ...(updates.content !== undefined && { content: updates.content }),
      ...(updates.completedAt !== undefined && {
        completedAt: updates.completedAt,
      }),
      ...(updates.categoryId !== undefined && {
        categoryId: updates.categoryId,
      }),
      updatedAt: new Date(),
    });
    return updatedTodo ?? null;
  });

export const deleteTodo = authedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { repos } = context;
    await repos.todoItem.deleteById(input.id);
    return { success: true };
  });
