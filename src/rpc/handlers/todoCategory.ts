import { z } from "zod";
import { authedProcedure } from "../base";

export const listCategories = authedProcedure.handler(async ({ context }) => {
  const { repos } = context;
  return repos.todoCategory.findByUserId(context.user.id);
});

export const createCategory = authedProcedure
  .input(
    z.object({
      name: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const { repos } = context;
    const newCategory = await repos.todoCategory.insertReturn({
      id: crypto.randomUUID(),
      userId: context.user.id,
      name: input.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return newCategory ?? null;
  });

export const updateCategory = authedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const { repos } = context;
    const { id, ...updates } = input;
    const updatedCategory = await repos.todoCategory.updateById(id, {
      ...updates,
      updatedAt: new Date(),
    });
    return updatedCategory ?? null;
  });

export const deleteCategory = authedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { repos } = context;
    await repos.todoCategory.deleteById(input.id);
    return { success: true };
  });
