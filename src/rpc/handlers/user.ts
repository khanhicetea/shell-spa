import { authedProcedure } from "../base";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema/auth.schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getAllUsers = authedProcedure.handler(async () => {
  const users = await db.query.user.findMany();
  return users;
});

export const getUserById = authedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const foundUser = await db.query.user.findFirst({
      where: eq(userTable.id, input.id),
    });
    return foundUser;
  });

export const createUser = authedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      email: z.email(),
      password: z.string().min(6),
    }),
  )
  .handler(async ({ input }) => {
    const newUser = await db
      .insert(userTable)
      .values({
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        emailVerified: false,
      })
      .returning();
    return newUser[0];
  });

export const updateUser = authedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const updatedUser = await db
      .update(userTable)
      .set({
        name: input.name,
        email: input.email,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, input.id))
      .returning();
    return updatedUser[0];
  });

export const deleteUser = authedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const deletedUser = await db
      .delete(userTable)
      .where(eq(userTable.id, input.id))
      .returning();
    return deletedUser[0];
  });
